---
title: protoo - Documentation
has_code: true
---

# Documentation


* [Getting Started](/documentation/getting-started/).

```javascript
var protoo = require('protoo');
var app = protoo();

app.use('/', function(req, next) {
    console.log('handling request: %s', req);
    next();
});
```
