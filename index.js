const http = require('http');
const express = require('express');

let app = express();
app.set('view engine', 'pug');
app.set('views', './views')

// app.get('/', function (req, res) {
//     res.send('Hello World!')
//   })

 app.get('/', function (req, res) {
    res.render('index');
});

app.get('/login', function (req, res) {
    res.render('login');
});

app.get('/signup', function (req, res) {
    res.render('register');
});

app.use(express.static('public'));
  
  app.listen(3000, function () {
    console.log('Server lancé sur le port 3000 !')
})