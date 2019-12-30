const express = require('express');
require('./db/mongoose');

const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();

// //Maintainance mode
// app.use((req, res, next) => {
//     res.status(503).send('Maintainance mode');
// });

//Automatically parse the incoming JSON
app.use(express.json());
//Use routers
app.use(userRouter);
app.use(taskRouter);

module.exports = app;
