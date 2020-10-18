const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

const routes = require('./api/routes');

routes(app);
app.listen(port, function() {
    console.log('Server started on port: ' + port);
});

// serve raw files in this folder
app.use(express.static('public'));


