const { Server } = require('socket.io');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authorization');
const prodRoutes = require('./routes/product');

const app = express();

app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    // res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});

app.use('/auth', authRoutes);
app.use('/prod', prodRoutes);
// app.use(prodRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
  });


mongoose.connect(
    'mongodb+srv://latikasood1997:GnHLTvzKPOV4SrYB@cluster0.wcwvz.mongodb.net/shopcart?retryWrites=true&w=majority&appName=Cluster0'
)
.then(result => {
    const server = app.listen(8080);
    console.log("Connected!!!!")
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true
        }
    });
    io.on("connection", (socket) => {
        console.log("Client connected");
    });
})
.catch(err => console.log(err));


