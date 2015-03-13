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

The top level function exported by the **protoo** module. It creates a Protoo [Application](#app).

```javascript
var protoo = require('protoo');
var app = protoo();
```


</section>


## Application
{: #app}

The Protoo application, typically named `app`. Created by calling the top-level [protoo()](#protoo-function) function.

```javascript
var app = protoo();
```

The application instance provides methods for:

* Configuring the application via settings.
* Building the request routing logic by adding middlewares.
* Adding network transports.


### Configuration Methods
{: #app-configuration-methods}

<section markdown='1'>


The table below lists available application settings:

<div markdown='1' class='table-wrapper'>

Setting Name             | Type    | Value         | Default
------------------------ | ------- | ------------- | -------------
`env`                    | String  | Environment mode. | `NODE_ENV` environment variable or "development".
`case sensitive routing` | Boolean | Enable case sensitivity. | Disabled. Treats "/Users" and "/users" as the same.
`strict routing`         | Boolean | Enable strict routing. | Disabled. Treats "/users/" and "/users" as the same.
`disconnection grace period` | Number | Milliseconds to wait for a peer to reconnect before emitting 'offline'. Useful for website reload in the browser. | 0 (disabled).

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


For a better understanding of how routing works check the [Routing](/documentation/routing/) documentation.


#### app.use([mountPath], [function, ...] function)
{: #app-use .code}

Mounts the middleware `function`(s) at the `mountPath`. If `mountPath` is not specified it defaults to "/".

Mounting a middleware at a path will cause the middleware function to be executed for every request method whenever the base of the requested path matches the mount path.

<div markdown='1' class='note'>
A route will match any mount path which follows its path immediately with a "/". For example: `app.use('/services', ...)` will match **/services**, **/services/multiconference** and so on.
</div>

`mountPath` can be a string representing a path, a path pattern, a regular expression to match paths, or an array of combinations thereof:

* Path:

```javascript
// Will match any path starting with /abcd
app.use('/abcd', function(req, next) {
    next();
});
```

* Path Pattern:

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

* Regular Expression:

Named parameters (see below) cannot be set when using regular expressions for the `mountPath`.

```javascript
// will match paths starting with /abc and /xyz
app.use(/\/abc|\/xyz/, function(req, next) {
    next();
});
```

* Array:

```javascript
// will match paths starting with /abcd, /xyza, /lmn, and /pqr
app.use(['/abcd', '/xyza', /\/lmn|\/pqr/], function(req, next) {
    next();
});
```

The `app.use()` method supports named parameters that become a field within the [req.params](#req-params) object.

```javascript
app.use('/services/:service', function(req, next) {
    console.log('service requested: %s', req.params.service);
    next();
});
```


#### app.METHOD(path, [function, ...] function)
{: #app-METHOD .code}

Routes a Protoo request where METHOD is the Protoo method of the request, such as "message", "session", and so on. The middleware function(s) are invoked just if the path of the request matches the given `path`.

You can provide multiple callback functions that behave just like middleware, except that these callbacks can invoke `next('route')` to bypass the remaining route callback(s). You can use this mechanism to impose pre-conditions on a route, then pass control to subsequent routes if there is no reason to proceed with the current route.

```javascript
app.message('/users/:username/:uuid?', function(req, next) {
    console.log('processing message request');

    // Invoke next() to pass the control to the next middleware.
    next();
});
```


#### app.all(path, [function, ...] function)
{: #app-all .code}

This method is like the standard [app.METHOD()](#app-METHOD) methods, except it matches all Protoo methods.

It’s useful for mapping "global" logic for specific path prefixes or arbitrary matches regardless which method the request has.

```javascript
app.all('*', function(req, next) {
    console.log('processing %s request', req.method);

    // Invoke next() to pass the control to the next middleware.
    next();
});
```


#### app.param(name, function)
{: #app-param .code}

Adds callback triggers to route parameters, where `name` is the name of the parameter or an array of them, and `function` is the callback function. The parameters of the callback function are the request object, the next middleware, and the value of the parameter, in that order.

For example, when `:user` is present in a route path, you may map user loading logic to automatically store `user` into the request and make it accesible in the whole route, or perform validations on the parameter input.

```javascript
app.param('userId', function(req, next, userId) {
    // Get the user details from the User model and attach it to the request object.
    User.find(userId, function(err, user) {
        if (user) {
            // User found, store it into the request.
            req.set('user', user);
            // Call next() to pass the control to the next middleware.
            next();
        }
        if (err) {
            // Error. Call next() with the error.
            next(err);
        }
        else {
            // User not found. Generate an error and call next() with it.
            next(new Error('user not found'));
        }
    });
});

app.message('/:userId', function(req, next) {
    // If here it means that the requested userId has been validated by the
    // above param rule.
    console.log('requested userId: %s', req.params.userId);
    console.log('requested user: %o', req.get('user'));

    // Do something here or pass control to the next middleware by calling next().
});
```

Param callback functions are local to the router on which they are defined. They are not inherited by mounted routers. Hence, param callbacks defined on `app` will be triggered only by route parameters defined on `app` routes.

A param callback will be called only once in a request-response cycle, even if the parameter is matched in multiple routes, as shown in the following example.

```javascript
app.param('username', function (req, next, username) {
    console.log('CALLED ONLY ONCE');
    next();
})

app.message('/user/:username', function (req, next) {
    console.log('although this matches');
    next();
});

app.messaget('/user/:username', function (req, next) {
    console.log('and this matches too');
    next();
});
```


#### app.route(path)
{: #app-route .code}

Returns an instance of a single route, which you can then use to handle Protoo requests with optional middleware. Use `app.route()` to avoid duplicate route names (and thus typo errors).

```javascript
app.route('/users/:username/:uuid?')
    .all(function(req, next) {
        // Runs for all Protoo requests first.
        next();
    })
    .message(function(req, next) {
        // Just runs for 'message' requests.
        // Do something here with the request.
    })
    .session(function(req, next) {
        // Just runs for 'session' requests.
        // Do something here with the request.
    });
```


#### app.Router([options])
{: #app-Router .code}

Creates a router that inherits settings from the `app`. Check the [Router](#router) documentation for detailed information.


#### app.peers(username, [[uuid], function])
{: #app-peers .code}

Returns the number of online peers matching the given `username` and (optional) `uuid`, and run the given handler `function` for all of them.

The optional `function` is called with each retrieved [Peer](#peer) instance as argument.

<div markdown='1' class='note'>
This method is useful for middleware developers that want to forward or send requests to online peers.
</div>

```javascript
app.route('/users/:username/:uuid?')
    .message(function(req, next) {
        var found;

        found = app.peers(req.params.username, req.params.uuid, function(peer) {
            console.log('sending message request to %s', peer);
            peer.send(req);
        });

        if (found) {
            req.reply(200, 'message sent to ' + found + ' peers');
        }
        else {
            req.reply(404, 'peer not found');
        }
    });
```


</section>


### Events
{: #app-events}

<section markdown='1'>
    

The application inherits from the Node [EventEmitter](https://nodejs.org/api/events.html#events_class_events_eventemitter) class. The list of emitted events is described below.


#### app.on('online', callback(peer))
{: #app-on-online .code}

Emitted when a peer connects to Protoo. The [Peer](#peer) instance is given as callback parameter.

```javascript
app.on('online', function(peer) {
    console.log('peer online: %s', peer);
});
```


#### app.on('offline', callback(peer))
{: #app-on-offline .code}

Emitted when a peer is disconnected. The [Peer](#peer) instance is given as callback parameter.

```javascript
app.on('offline', function(peer) {
    console.log('peer offline: %s', peer);
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


## Router
{: #router}

A router object is an isolated instance of middleware and routes. You can think of it as a "mini-application" capable only of performing middleware and routing functions. A Protoo `Application` has a built-in router.

A router behaves like middleware itself, so you can use it as an argument to [app.use()](#app-use) or as the argument to another router’s [use()](#router-use) method.

Given a Protoo `Application` a new `Router` can be created using the [app.Router()](#app-Router) method, which creates a new `Router` instance by inheriting the `app` settings.

`app.Router([options])` accepts an object with the following options:

<div markdown='1' class='table-wrapper'>

Property        | Type     | Description                     |  Default
--------------- | -------- | ------------------------------- | -------------
`caseSensitive` | Boolean  | Enable case sensitivity. Inherits from the application `case sensitive routing` setting. | Disabled. Treats “/Services” and “/services as the same.
`strict`        | Boolean  | Enable strict routing. Inherits from the application `strict routing` setting. | Disabled. Treats “/services/” and “/services as the same.
`mergeParams`   | Boolean  | Preserve [req.params](#req-params) values from the parent router. If the parent and the child have conflicting param names the child’s value take precedence. | `false` 

</div>


### Methods
{: #router-methods}

<section markdown='1'>


#### router.use([mountPath], [function, …] function)
{: #router-use .code}

Uses the given middleware `function`(s) with optional mount path `mountPath`, that defaults to "/". This method is similar to [app.use()](#app-use).

Middleware is like a plumbing pipe. Requests start at the first middleware you define and work their way "down" the middleware stack processing for each path they match.

```javascript
var protoo = require('protoo');
var app = protoo();
var router = protoo.Router();

router.use(function(req, next) {
    // Will match any request with path starting with /users.
    next();
});

// Mount the router in "/users" path.
app.use('/users', router);
```

The `mountPath` path is stripped and is **not** visible to the middleware function. The main effect of this feature is that mounted middleware may operate without code changes regardless of its "prefix" path.

The order in which middlewares are defined with `router.use()` is very important as they are invoked sequentially, thus the order defines middleware precedence.

The `router.use()` method also supports named parameters so that your mount points for other routers can benefit from preloading using named parameters.

```javascript
router.use('/:username', function(req, next) {
    // Will match any request with path starting with /users followed by a
    // slash and a string that will become req.params.username.
    console.log('username: %s', req.params.username);
    next();
});

app.use('/users', router);
```


#### router.METHOD(path, [function, …] function)
{: #router-METHOD .code}

Same functionality as the provided by the [app.METHOD()](#app-METHOD) method, but within the isolated instance of middleware and routes in the `router`.

```javascript
router.session('/:username/:uuid?', function(req, next) {
    console.log('processing session request for user %s', req.params.username);
    next();
});

router.message('/:username/:uuid?', function(req, next) {
    console.log('processing message request for user %s', req.params.username);
    next();
});
```


#### router.all(path, [function, …] function)
{: #router-all .code}

Same functionality as the provided by the [app.all()](#app-all) method, but within the isolated instance of middleware and routes in the `router`.

```javascript
router.all('/:username/:uuid?', function(req, next) {
    console.log('processing %s request', req.method);
    next();
});
```


#### router.param(name, function)
{: #router-param .code}

Same functionality as the provided by the [app.param()](#app-param) method, but within the isolated instance of middleware and routes in the `router`.

```javascript
router.param('service', function(req, next, service) {
    // Validate service.
    if (service !== 'conference' && service !== 'echo') {
        // Reject the request and finish the routing logic.
        req.reply('404', 'service not available');
        return;
    }

    next();
});

router.session('/:service', function(req, next) {
    // If here it means that the requested service has been validated by the
    // above param rule.
    console.log('requested service: %s', req.params.service);

    // Do something here or pass control to the next middleware by calling next().
});
```


#### router.route(path)
{: #router-route .code}

Same functionality as the provided by the [app.route()](#app-route) method, but within the isolated instance of middleware and routes in the `router`.

```javascript
router.route('/:username/:uuid?')
    .all(function(req, next) {
        // Runs for all Protoo requests first.
        next();
    })
    .message(function(req, next) {
        // Just runs for 'message' requests.
        // Do something here with the request.
    })
    .session(function(req, next) {
        // Just runs for 'session' requests.
        // Do something here with the request.
    });
```


</section>


## Peer
{: #peer}

A peer is a client connected to Protoo. The application is responsible for accepting clients' connections (or rejecting them) and assigning them a `username` and a `uuid`.

When using WebSocket access, a peer is generated within the `requestListener` callback given to [app.websocket()](#app-websocket).


### Properties
{: #peer-properties}

<section markdown='1'>


#### peer.username
{: #peer-username .code}

The account username of the peer. Read-only property.

```javascript
peer.username;
// => "alice"
```


#### peer.uuid
{: #peer-uuid .code}

A unique identificator for the specific device this client connects from. Read-only property.

```javascript
peer.uuid;
// => "j36sjh23oi9"
```


#### peer.data
{: #peer-data .code}

An object with custom data associated to this peer. Both the user application and the routing middleware can write on it at any time. Specific middleware may perform different routing logic based on custom data the user application must provide during the peer creation.

```javascript
peer.data['role'] = 'admin';
```


#### peer.connected
{: #peer-connected .code}

Boolean flag indicating whether the peer is currently connected or not. Useful when handling a peer after an asynchronous operation which may take some time, so the peer may have disconnected in the meanwhile.

```javascript
peer.connected;
// => true
```


</section>


### Methods
{: #peer-methods}

<section markdown='1'>


#### peer.send(req)
{: #peer-send .code}

Sends the given Protoo [request](#req) to the peer.

Check the usage example in [app.peers()](#app-peers).


#### peer.close([code], [reason])
{: #peer-close .code}

Disconnects the peer.

* `code`: Status code number (defaults to 1000).
* `reason`: Closure description string (defaults to "normal closure").

`code` values inherit the same semantics as those defined in the [WebRTC RFC 6455](https://tools.ietf.org/html/rfc6455#section-7.4).

<div markdown='1' class='note'>
When calling this method on a peer connected via WebSocket, the given `code` and `reason` arguments are used to set the WebSocket Close `code` and `reason` fields.
</div>


</section>


## Request
{: #req}

A `Request` represents a Protoo protocol request message. For further information check the Protoo's [protocol](/documentation/protocol) documentation.

A `Request` instance is created by the Protoo server when a [peer](#peer) sends a request to it. It can also be generated by the application running on top of Protoo and be sent to online peers.

A Protoo request message is a JSON body with mandatory and optional fields.

```javascript
{
    "method" : "message",
    "path"   : "/users/alice",
    "id"     : "jhk3ghj9sd",
    "data"   : {
        [...]
    }
}
```

Note however that the `Request` instance includes properties other than those present in the JSON body.


### Properties
{: #req-properties}

<section markdown='1'>


#### req.method
{: #req-method .code}

The Protoo method of the request. Mandatory field in the JSON body.

```javascript
req.method;
// => "session"
```


#### req.path
{: #req-path .code}

The requested path of the request. Mandatory field in the JSON body.

Resources in the Protoo protocol are defined as URL paths.

```javascript
req.path;
// => "/users/alice"
```


#### req.id
{: #req-id .code}

The transaction identifier. Mandatory field in the JSON body.

A transaction involves both a single request and one or more [responses](#res). The `id` value is common for a request and its responses.

```javascript
req.id;
// => "sajhkj78sdjhjhk"
```


#### req.data
{: #req-data .code}

An object with the required data for specific method and usages. Optional field in the JSON body.

```javascript
req.data;
// => { "type": "text", "text": "Hi Alice!" }
```


#### req.sender
{: #req-sender .code}

An object with information about the sender of the request (usually a [peer](#peer)). This field can only be added to the JSON body by the Protoo server when the application forwards an incoming request to any online peer, or when the application generates a request by its own.

<div markdown='1' class='note'>
If a request containing a `sender` field is received by the Protoo server it is ignored, as the server determines the source peer by the transport from which the request was received.
</div>

When the sender of a request is a peer, the `sender` field has the following fields:

* `username`:  The username of the peer who sent the request.
* `uuid`:  The uuid of the peer who sent the request.

```javascript
req.sender;
// => { "username": "bob", "uuid": "kjh87jhgas0j" }
```


#### req.peer
{: #req-peer .code}

The [Peer](#peer) instance from which this request was originated.


#### req.app
{: #req-app .code}

A referente to the Protoo [Application](#app) handling this request.


#### req.params
{: #req-params .code}

An object which is filled by the rougin logic when named parameters are used by the middlewares matched by this request. See [app-param()](#app-param) and [router-param()](#router-param) for further information.


#### req.ended
{: #req-ended .code}

A boolean which is set to `true` by the Protoo server once the incoming request has been replied with a final [response](#response) (status code between 200 and 699).


</section>


### Methods
{: #req-methods}

<section markdown='1'>


#### req.set(name, value)
{: #req-set .code}

Assigns the custom property `name` to `value`. Key/values set with this method can be later retrieved using the [req.get()](#req-get) method.

```javascript
req.set('role', 'guest');
```


#### req.get(name)
{: #req-get .code}

Retrieves a custom property `name` previously set with the [req.set()](#req-set) method.

```javascript
req.get('role');
// => "guest"
```


#### req.reply(status, [reason], [data])
{: #req-reply .code}

Sends a Protoo [response](#res) for this request. For more information check the Protoo's [protocol](/documentation/protocol) documentation.

* `status`: A number indicating the status code (200-699).
* `reason`: A descritive string.
* `data`: An optional object with custom fields.

All these arguments are mapped into their respective fields in the generated JSON body.

```javascript
req.reply(404, 'Not Found');
```


#### req.onresponse(callback(res))
{: #req-onresponse .code}

Adds a listener for every future response associated to this request. The given `callback` is called with the [Response](#res) instance as argument.

Callbacks are executed in reverse order.

```javascript
req.onresponse(function(res) {
    console.log('callback #1');
});

req.onresponse(function(res) {
    console.log('callback #2');
});

req.reply(200, 'OK');
// => "callback #2"
// => "callback #1"
```


</section>


## Response
{: #res}

A `Response` represents a Protoo protocol response message. For further information check the Protoo's [protocol](/documentation/protocol) documentation.

A `Response` instance is created by the Protoo server when calling [req.reply()](#req-reply). It is also generated by online peers when they receive a request from the Protoo server.

A Protoo response message is a JSON body with mandatory and optional fields.

```javascript
{
    "status" : 200,
    "reason" : "OK",
    "id"     : "jhk3ghj9sd",
    "data"   : {
        [...]
    }
}
```


### Properties
{: #res-properties}

<section markdown='1'>


#### res.status
{: #res-status .code}

The Protoo status code of the response. Mandatory field in the JSON body.

```javascript
res.status;
// => 200
```


#### res.reason
{: #res-reason .code}

The descritive reason phrase of the response. Mandatory field in the JSON body.

```javascript
res.reason;
// => "OK"
```


#### res.id
{: #res-id .code}

The transaction identifier. Mandatory field in the JSON body.

Its value matches that in the [request](#req) this response is associated to.

```javascript
res.id;
// => "sajhkj78sdjhjhk"
```


#### res.data
{: #res-data .code}

An object with the required data for specific method and usages. Optional field in the JSON body.

```javascript
res.data;
// => { "foo": 1234 }
```
