require('dotenv').config() //Charge les variable d'environement

const http = require('http');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

app.set('view engine', 'pug');
app.set('views', './views')


app.use(express.static('public')); //meadleWear
app.use(bodyParser.urlencoded({
    extended: false
}))

require('./app/routes')(app);

mongoose.connect(`mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DBNAME}`, {
        userNewUrlParser: true // Enlève le message erreur
    })
    .then(() => {
        app.listen(3000, function () {
            console.log('Server lancé sur le port 3000 !')
        })
    })