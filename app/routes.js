const User = require('./models/User.model.js');


module.exports = function (app) {


    app.get('/', function (req, res) {
        res.render('index');
    });

    app.get('/login', function (req, res) {
        res.render('login');
    });

    app.get('/signup', function (req, res) {
        res.render('register');
    });

    app.post('/signup', (req, res) => {
        //console.log(req.body)
        User.signup(
            req.body.firstname,
            req.body.lastname,
            req.body.email,
            req.body.pass,
            req.body.pass_confirmation
        ).then(() => {
            res.redirect('/?signup=ok')
        })
        .catch( err => {
            res.render("register", {errors, user: req.body})
        })
    });
}