
const express = require('express');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors');

const routes = require('./routes/employeeRoutes'); //importing route

// initialize express & bodyParser.
const app = express();
app.use(cors({ origin: true }));

port = process.env.PORT || 3000;
bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Register routes.
routes(app);

// Listen on port.
app.listen(port);
console.log('todo list RESTful API server started on: ' + port);
