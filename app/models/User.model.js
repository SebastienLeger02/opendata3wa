// Utilisation du module npm 'mongoose'
const mongoose = require('mongoose');
const hash = require('./../hash');

// Définition du "Schéma" d'un utilisateur
const UserSchema = mongoose.Schema({
    firstname: {
        type: String,
        required: [true, 'Le champs "prénom" est obligatoire']
    },

    lastname: {
        type: String,
        required: [true, 'Le champs "nom" est obligatoire']
    },

    // Validateur personnalisé qui vÃ©rifie le format d'une adresse e-mail.
    // Basé sur la documentation de mongoose : http://mongoosejs.com/docs/validation.html#custom-validators 
    email: {
        type: String,
        validate: {
            validator: function (mailValue) {
                // c.f. http://emailregex.com/
                const emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return emailRegExp.test(mailValue);
            },
            message: 'L\'adresse email {VALUE} n\'est pas une adresse RFC valide.'
        },
    },

    salt: {
        type: String
    },

    hash: {
        type: String
    },

    githubId: {
        type: String
    },

    avatarUrl: {
        type: String
    }

});

UserSchema.statics.register = function (firstname, lastname, email, pass, pass_confirmation) {

    // Vérification des champs de mot de passe
    const pass_errors = []

    if (pass.trim() === '')
        pass_errors.push('Le champs "mot de passe" est obligatoire')

    if (pass_confirmation.trim() === '')
        pass_errors.push('Le champs "confirmation de mot de passe" est obligatoire')

    if (pass_errors.length === 0 && pass.trim() !== pass_confirmation.trim())
        pass_errors.push('Les mots de passe doivent être identiques')

    if (email.trim() === '')
        pass_errors.push('L\'adresse email doit être renseignée')

    if (pass_errors.length > 0)
        return Promise.reject(pass_errors)

    /*
        Insertion en base, en utilisant la méthode .create() de d'un Model mongoose
        c.f. http://mongoosejs.com/docs/api.html#create_create

        Cette méthode renvoie une Promesse JS. Avec l'instruction 'return', on renvoie donc
        la promesse comme valeur de 'UserSchema.statics.signup'
    */

    return this.findOne({
            email: email
        })
        .then(user => {
            if (user)
                return Promise.reject(new Error(`Cette adresse email est déjà utilisée (${user.email})`));
        })
        .then(() => hash(pass))
        .then(({
            salt,
            hash
        }) => {
            return this.create({
                firstname: firstname,
                lastname: lastname,
                email: email,
                salt: salt,
                hash: hash
            })
        }).catch(err => {
            // Fabrication d'un tableau de messages d'erreur (extraits de l'objet 'ValidationError' renvoyé par Mongoose)
            if (err.errors)
                throw Object.keys(err.errors).map(field => err.errors[field].message);

            throw [err.message ? err.message : err];
        })
};

/*
    Ajout de la méthode permettant de vérifier un mot de passe
*/

UserSchema.statics.verifyPass = function (passwordInClear, userObject) {
    const salt = userObject.salt;
    const userHash = userObject.hash;

    return hash(passwordInClear, salt).then((data) => {
        if (data.hash === userHash) {
            return Promise.resolve(userObject)
        } else {
            return Promise.reject(new Error('Mot de passe invalide!'))
        }
    });
    /*
        Ajout d'une méthode permettant de récupérer (ou d'inscrire si inexistant) un utilisateur
        qui s'est loggué via Github
    */

    UserSchema.statics.signupViaGithub = function (profile) {

        // Recherche si cet utilisateur (loggué via Github) n'est pas déjà dans notre base mongo ?
        return this.findOne({
                'githubId': profile.id
            })
            .then(user => {
                // Non ! Donc on l'inscrit dans notre base..
                if (user === null) {
                    if (profile.displayName === null) {
                        profile.displayName = "Nom Auto-généré"
                        const [firstname, lastname] = profile.displayName.split(' ');
                        return this.create({
                            githubId: profile.id,
                            firstname: firstname || '',
                            lastname: lastname || '',
                            avatarUrl: profile.photos[0].value // Photo par défaut de l'user Github
                        });
                    } else {
                        const [firstname, lastname] = profile.displayname.split(' ');
                        return this.create({
                            githubId: profile.id,
                            firstname: firstname || '',
                            lastname: lastname || '',
                            avatarUrl: profile.photos[0].value // Photo par défaut de l'user Github
                        });
                    }

                }
                // On renvoie l'utilisateur final
                return user;
            });
    }
}
// Export du Modele mongoose representant un objet User
module.exports = mongoose.model('User', UserSchema);