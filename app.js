const express = require('express');
const mongoose = require('mongoose');

const app = express();

app.use((req, res) => {
    res.json({
        message: 'Your request was successful!'
    });
});

mongoose.connect('mongodb+srv://will:<PASSWORD>@cluster0-pme76.mongodb.net/test?retryWrites=true')
    .then(() => {
        console.log('Successfully connected to MongoDB Atlas!');
    })
    .catch((error) => {
        console.log('Unable to connect to MongoDB Atlas!');
        console.error(error);
    });

module.exports = app;