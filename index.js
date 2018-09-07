require('dotenv').config() //Charge les variable d'environement

const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport')
const app = express();

app.set('view engine', 'pug');
app.set('views', './views')


app.use(express.static('public')); //meadleWear
//http://expressjs.com/fr/starter/static-files.html
app.use(bodyParser.urlencoded({
    extended: false
}))

// remplace $_SESSION pour avoir des session req.session
app.use(session({
    secret: "Shh, its a secret!",
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false
    }
}));

app.use(flash());
app.use((req, res, next) => { // Middlewear
    app.locals.flashMessage = req.flash()
    next()
})

app.use(passport.initialize())
app.use(passport.session())

require('./app/passport')(passport);
require('./app/routes')(app, passport);


mongoose.connect(`mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DBNAME}`, {
        userNewUrlParser: true // Enlève le message erreur
    })
    .then(() => {
        app.listen(3000, 'localhost', () => {
            console.log('Server lancé sur le port 3000 !')
        })
    })


// Permet de compter le nombre de pages.
app.get('/', function (req, res) {
    if (req.session.page_views) {
        req.session.page_views++;
        res.send("You visited this page " + req.session.page_views + " times");
    } else {
        req.session.page_views = 1;
        res.send("Welcome to this page for the first time!");
    }
});