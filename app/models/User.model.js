// Utilisation du module npm 'mongoose'
const mongoose = require('mongoose');
const hash = require('./../hash');

// Définition du "Schéma" d'un utilisateur
const UserSchema = mongoose.Schema({
	firstname : { 
        type: String,
        required: true 
    },

	lastname : { 
        type: String,
        required: true 
    },
    
    // Validateur personnalisé qui vÃ©rifie le format d'une adresse e-mail.
    // Basé sur la documentation de mongoose : http://mongoosejs.com/docs/validation.html#custom-validators 
    email : {
        type: String,
        validate: {
            validator: function(mailValue) {
                // c.f. http://emailregex.com/
                const emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return emailRegExp.test(mailValue);
            },
            message: 'L\'adresse email {VALUE} n\'est pas une adresse RFC valide.'
        }
    },

    salt: { 
        type: String,
        required: true  
    },

    hash: { 
        type: String, 
        required: true 
    }

});

UserSchema.statics.signup = function(firstname, lastname, email, pass, pass_confirmation) {

   return hash(pass).then(data => {
        return this.create({
            firstname : firstname,
            lastname : lastname,
            email : email,
            salt : data.salt,
            hash : data.hash
        })
    })
    
}

// Export du Modele mongoose representant un objet User
module.exports = mongoose.model('User', UserSchema);