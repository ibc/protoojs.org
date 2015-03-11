---
title: API
code: true
toc: true
---


<div markdown='1' class='toc-wrapper hidden'>
* Will be replaced with the ToC
{: toc .toc}
</div>

<div markdown='1' class='toc-button'>
</div>


# API


## protoo
{: #protoo}

The top-level **protoo** module.

```javascript
var protoo = require('protoo');
```


### Properties
{: #protoo-properties}

<section markdown='1'>


#### protoo.version
{: #protoo-version .code}

A string indicating the version of the **protoo** module.

```javascript
protoo.version;
// => "X.Y.Z"
```


#### protoo.middleware
{: #protoo-middleware .code}

An object with the Protoo's built-in middlewares:

* `messenger`
* `sessionHandler`

```javascript
var messenger = protoo.middleware.messenger;

app.use('/users', messenger(app, {
    path: '/:username/:uuid?'
}));
```

For more information check the [Middleware](/documentation/middleware/) section.


</section>


### Methods
{: #protoo-methods}

<section markdown='1'>


#### protoo()
{: #protoo-function .code}

The top level function exported by the **protoo** module. It creates a Protoo `Application`.

```javascript
var protoo = require('protoo');
var app = protoo();
```


</section>


## Application
{: #app}

The Protoo application, typically named `app`. Created by calling the top-level **protoo** module function.

```javascript
var app = protoo();
```

The application instance provides methods for:

* Configuring the application via settings.
* Building the request routing logic by adding middlewares.
* Adding network transports.

The application inherits from the Node [EventEmitter](https://nodejs.org/api/events.html#events_class_events_eventemitter) class.


### Configuration Methods
{: #app-configuration-methods}

<section markdown='1'>


The table below lists available application settings.

<div markdown='1' class='table-wrapper'>

Setting Name             | Type    | Value         | Default
------------------------ | ------- | ------------- | -------------
`env`                    | String  | Environment mode. | `NODE_ENV` environment variable or "development".
`case sensitive routing` | Boolean | Enable case sensitivity. | Disabled. Treats "/Users" and "/users" as the same.
`strict routing`         | Boolean | Enable strict routing. | Disabled. Treats "/users/" and "/users" as the same.

</div>


#### app.set(name, value)
{: #app-set .code}

Configuration setter. Assigns the setting `name` to `value`.

```javascript
app.set('env', 'development');
```


#### app.get(name)
{: #app-get .code}

Configuration getter. Gets the value of setting `name`.

```javascript
app.get('env');
// => "development"
```


#### app.enable(name)
{: #app-enable .code}

Sets the Boolean setting `name` to `true`. Has the same effect as calling `set(name, true)`.

```javascript
app.enable('strict routing');
```


#### app.disable(name)
{: #app-disable .code}

Sets the Boolean setting `name` to `false`. Has the same effect as calling `set(name, false)`.

```javascript
app.disable('case sensitive routing');
```


#### app.enabled(name)
{: #app-enabled .code}

Returns `true` if the setting `name` is enabled (`true`).

```javascript
app.enabled('strict routing');
// => true
```


#### app.disabled(name)
{: #app-disabled .code}

Returns `true` if the setting `name` is disabled (`false`).

```javascript
app.disabled('case sensitive routing');
// => true
```


</section>


### Transport Methods
{: #app-transport-methods}

<section markdown='1'>


#### app.websocket(httpServer, requestListener)
{: #app-websocket .code}

Adds a WebSocket server to the application.

The `httpServer` parameter must be a Node [http.Server](https://nodejs.org/api/http.html#http_class_http_server) or [https.Server](https://nodejs.org/api/https.html#https_class_https_server) instance or a compatible one (such as [node-sdpy](https://github.com/indutny/node-spdy)). The user is responsible for binding the HTTP server into the desired IP and port.

<div markdown='1' class='note'>
If the given HTTP server is not being driven by Express or any other HTTP server it is recommended to handle HTTP requests others than "upgrade" by replying them with status 404. That avoids persistent TCP connections if a browser sends a common HTTP request to the Protoo server.

```javascript
var httpServer = http.createServer(function(req, res) {
    res.writeHead(404, 'Not Here');
    res.end();
});
```
</div>

The `requestListener` argument is a callback for handling clients' WebSocket connection requests. It is called with the following parameters:

* `info`: An object with information about the WebSocket connection request:
    * `req`: The HTTP request (if a Node `http.Server` is used it becomes an instance of [http.IncomingMessage](https://nodejs.org/api/http.html#http_http_incomingmessage)).
    * `origin`: A string containing the Origin header value of the request (may be `undefined`).
    * `socket`: The Node [net.Socket](https://nodejs.org/api/net.html#net_class_net_socket) instance.
* `accept(username, uuid, data)`: A function the application must invoke in order to accept the WebSocket connection and generate a new peer associated to it. Function arguments are:
    * `username`: Mandatory string containing the username of the peer.
    * `uuid`: Mandatory string containing the uuid of the peer.
    * `data`: An optional object with custom data assigned to the peer.
* `reject(code, reason)`: A function the application must invoke in order to reject the WebSocket connection attempt.
    * `code`: A number indicating the HTTP status code (defaults to 403).
    * `reason`: A string containing the reason phrase of the HTTP response (defaults to "Rejected").

```javascript
var protoo = require('protoo');
var http = require('http');
var url = require('url');

var app = protoo();
var httpServer = http.createServer(function(req, res) {
    res.writeHead(404, 'Not Here');
    res.end();
});

httpServer.listen(8080, '0.0.0.0');

app.websocket(httpServer, function(info, accept, reject) {
    // Require Origin to be http://protooapp.example.com.
    if (info.origin !== 'http://protooapp.example.com') {
        reject('403', 'Invalid Origin');
        return;
    }

    // Let the client choose his username and uuid and indicate them in the
    // URL query.
    var u = url.parse(req.url, true);
    var username = u.query.username;
    var uuid = u.query.uuid;

    console.log('accepting WebSocket connection [username:%s, uuid:%s, ip:%s, port:%d]',
        username, uuid, info.socket.remoteAddress, info.socket.remotePort);

    accept(username, uuid, null);
});
```


#### app.close([closeServers])
{: #app-close .code}

Closes the application and disconnect existing peers.

If `closeServers` is set to `true` then underlying servers (such as the HTTP servers given to `app.websocket()`) are also closed. Defaults to `false`. 


</section>


### Routing Methods
{: #app-routing-methods}

<section markdown='1'>


#### app.use([mountPath,] function [, function...])
{: #app-use .code}

Mounts the middleware `function`(s) at the `mountPath`. If `mountPath` is not specified it defaults to "/".

Mounting a middleware at a path will cause the middleware function to be executed for every request method whenever the base of the requested path matches the mount path.

<div markdown='1' class='note'>
A route will match any mount path which follows its path immediately with a "/". For example: `app.use('/services', ...)` will match **/services**, **/services/multiconference** and so on.
</div>

`mountPath` can be a string representing a path, a path pattern, a regular expression to match paths, or an array of combinations thereof:


##### Path

```javascript
// Will match any path starting with /abcd
app.use('/abcd', function(req, next) {
    next();
});
```


##### Path Pattern

```javascript
// will match paths starting with /abcd and /abd
app.use('/abc?d', function(req, next) {
    next();
});

// will match paths starting with /abcd, /abbcd, /abbbbbcd and so on
app.use('/ab+cd', function(req, next) {
    next();
});
```


##### Regular Expression

```javascript
// will match paths starting with /abc and /xyz
app.use(/\/abc|\/xyz/, function(req, next) {
    next();
});
```


##### Array

```javascript
// will match paths starting with /abcd, /xyza, /lmn, and /pqr
app.use(['/abcd', '/xyza', /\/lmn|\/pqr/], function(req, next) {
    next();
});
```


#### app.all(path, function [, function ...])
{: #app-all .code}

TODO


#### app.METHOD(path, function [, function ...])
{: #app-METHOD .code}

TODO


#### app.param(name, function)
{: #app-param .code}

TODO


#### app.route(path)
{: #app-route .code}

TODO


#### app.Router([options])
{: #app-Router .code}

TODO


#### app.peers(username, [uuid,] function)
{: #app-peers .code}

TODO


</section>


### Events
{: #app-events}

<section markdown='1'>
    

The application inherits from the Node [EventEmitter](https://nodejs.org/api/events.html#events_class_events_eventemitter) class. The list of emitted events is described below.


#### app.on('online', callback(peer))
{: #app-on-online .code}

Emitted when a peer connects to Protoo. The `Peer` instance is given as callback parameter.

```javascript
app.on('online', function(peer) {
    console.log('peer online [username:%s, uuid:%s]', peer.username, peer.uuid);
});
```


#### app.on('offline', callback(peer))
{: #app-on-offline .code}

Emitted when a peer is disconnected. The `Peer` instance is given as callback parameter.

```javascript
app.on('offline', function(peer) {
    console.log('peer offline [username:%s, uuid:%s]', peer.username, peer.uuid);
});
```


#### app.on('error:route', callback(error))
{: #app-on-error-route .code}

Emitted when an error throws in runtime while routing/dispatching a request. The `Error` instance is given as callback parameter.

```javascript
app.on('error:route', function(error) {
    console.error('routing error: %s', error);
});
```


</section>
