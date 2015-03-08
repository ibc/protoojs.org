---
title: Overview
has_code: true
---

# Overview

Protoo is a [Node.js](http://nodejs.org/) signaling framework that makes easy building Real-Time Communication applications. Its primary purpose is to provide existing Web applications with chat, presence and audio&video calling capabilities, although those are just few of many functionalities that Protoo can provide.

Protoo defines a signaling protocol based on JSON requests and responses. It is up to the application to define and extend the signaling protocol and the content of requests and responses in order to accomplish the desired feature set. However Protoo provides built-in middlewares for common functionalities such as basic messaging, calling, conference rooms and others.

Protoo integrates well with Node HTTP frameworks such as [Express](http://expressjs.com/) by sharing the same [httpServer](http://nodejs.org/api/http.html#http_http_createserver_requestlistener) instance, but it can also be run as a standalone server.


## Peers

Clients that connect to Protoo server are called **peers**. Those peers can be JavaScript applications running in a browser, native apps, etc.

A Protoo peer consists on a `username` and a `uuid`:

* `username`: The account username of the peer.
* `uuid`: A unique identificator for a specific device.

To better get the whole picture, let's say that Alice can connect to a Protoo server using a web application and her mobile app at the same time. Those are two peers with same `username` ("alice") but different `uuid` values ("jk6jghbd21" and "hvth3bksf").

It is up to the application running Protoo to accept clients' connections and assign them a `username` and a `uuid`. This process is called **authorization** and can be achieved in multiple ways (for example by examining the Cookie header of the Protoo connection request once the user has logged in into the website).


## Routing

How protocol requests are processed by Protoo is called **routing**. At API level Protoo provides an interface similar to the routing API of [Express](http://expressjs.com/) in which received requests are secuentially processed by all the request-matching middlewares loaded into the Protoo application until one of them finishes the propagation.

If you know Express you would probably love this:

```javascript
var protoo = require('protoo');
var messenger = protoo.middleware.messenger;

var app = protoo();

// Log every request from peers.
app.use(function logger(req, next) {
    console.log('processing %s request', req.method);
    next();
});

// messenger middleware handles 'message' requests.
// It is mounted on /users path.
app.use('/users', messenger(app));

// No 'session' support.
app.session(function no_session_support(req, next) {
    req.reply(403, 'sessions not implemented in this example');
});
```

Here a very simple and functional instant messaging server is implemented. Peers can now send requests as follows:

```javascript
{
    "method" : "message",
    "path"   : "/users/bob",
    "id"     : "sajg763tjau2",
    "data"   : {
        "type" : "text",
        "text" : "hi Bob!"
    }
}
```

Such a request will match the `logger` middleware (as any other request would do) and also the `messenger` middleware (which internally handles "message" requests and provides a final handling for them).

If a "session" request is received the application would rejected it with status 403 "forbidden" while any other method would be handled by the application internal final handler with a 404 "not found" response.
