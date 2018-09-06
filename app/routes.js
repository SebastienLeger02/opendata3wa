const User = require('./models/User.model');

module.exports = function (app, passport) {

            // Ce petit middleware met à disposition des variables pour toutes les 'views' Pug de l'application
	app.use((req, res, next) => {
    	app.locals.user = req.user // Récupération de l'objet 'user' (sera existant si une session est ouverte, et undefined dans le cas contraire)
        next()
    })

    app.get('/', function (req, res) {
        res.render('index');
    });

    app.get('/login', function (req, res) {
        res.render('login');
    });

    app.get('/signup', function (req, res) {
        res.render('register');
    });

    // Lorsqu'on tente de se connecter, c'est le middleware de passport qui prend la main, avec la stratégie "locale" (configurée dans ./passport.js )
    app.post('/login.pug', passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        badRequestMessage: 'Identifiants non valides!',
        failureFlash: true,
        successFlash: {
            message: 'Connexion réussie. Bienvenue !'
        }
    }));

    app.post('/signup', (req, res) => {
        //console.log(req.body)
        User.signup(
                req.body.firstname,
                req.body.lastname,
                req.body.email,
                req.body.pass,
                req.body.pass_confirmation
            ).then(() => {

                req.flash('success', 'Vous etes bien inscrit.')
                res.redirect('/') //redirection vers la page accueil
            })
            .catch(err => {
                res.render("register.pug", {
                    err,
                    user: req.body
                })
            })
    });
}