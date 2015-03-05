---
title: protoo - Overview
has_code: true
---

# Overview

Protoo is a [Node.js](http://nodejs.org/) signaling framework for building Real-Time Communication applications. Its primary purpose is to provide existing Web applications with chat, presence and audio&video calls capabilities, although Protoo's scope is not limited to just that.

Protoo defines a signaling protocol based on JSON requests and responses. It is up to the application to define and extend the signaling protocol and the content of requests and responses in order to accomplish the desired feature set.

Protoo integrates well with Node HTTP frameworks such as [Express](http://expressjs.com/) by sharing the same [httpServer](http://nodejs.org/api/http.html#http_http_createserver_requestlistener) instance, but it can also be run as a standalone server.


## Peers

Clients that connect to Protoo are called **peers**. Those peers can be JavaScript applications running in a browser, native apps, etc.

A Protoo peer consists on a `username` and a `uuid`:

* username: The account username of the peer.
* uuid: A unique identificator.

To better get the whole picture, let's say that Alice can connect to Protoo using a web application and her mobile app at the same time by providing the same `username` ("alice") but different `uuid` values ("jk6jghbd21" and "hvth3bksf").

It is up to the application running Protoo to accept clients' connections and to assign them a `username` and a `uuid`. This process is called **authorization**, and can be achieved in multiple ways (for example by examining the Cookie header of the connection request once a user has logged in into the website).


## Routing

How protocol requests are processed in Protoo is called **routing**. At API level Protoo provides an interface similar to the routing API of [Express](http://expressjs.com/) in which received requests are secuentially processed by all the middlewares loaded into the Protoo application until one of them stop the propagation.


If you know Express you would probably love this:

```javascript
var protoo = require('protoo');
var p2pMessenger = protoo.middleware.p2pMessenger;

var app = protoo();

app.use(function logger(req, next) {
    console.log('processing %s request', req.method);
    next();
});

app.session(function(req, next) {
    req.reply(403, 'sessions not implemented in this example');
});

app.use('/users', p2pMessenger(app));
```

Here a very simple and functional instant messaging server is implemented.
