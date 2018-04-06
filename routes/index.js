var express = require('express');
var router = express.Router();

var expressValidator = require('express-validator');
var passport= require('passport');

var mongo = require('mongodb').MongoClient;
var assert = require('assert');
var sha1 = require('sha1');
userDetail = false;



var url = 'mongodb://localhost:27017';

const dbName= 'jewellery';
/* GET home page. */
router.get('/', function(req, res, next) {
    console.log(req.user);
    console.log(req.isAuthenticated());
        res.render('index');


});



router.get('/register', function(req, res, next) {
    if(req.isAuthenticated()){
     res.redirect('/');
    }else {
        res.render('register', {success: req.session.success, errors: req.session.errors, existEmail: false, layout : 'user'});
    }


});





router.post('/submit', function(req, res, next) {
    userDetail = {

        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: sha1(req.body.password),
        mobile: req.body.mobile,
        role: req.body.role,
        profileImage: "https://x1.xingassets.com/assets/frontend_minified/img/users/nobody_m.original.jpg"

    };
    req.checkBody('firstName','First Name field Empty').notEmpty();
    req.checkBody('lastName','Last Name field Empty').notEmpty();
   req.check('email','Invalid Email').isEmail();
   req.check('password','Password Not Match').equals(req.body.confirmPassword);
   req.check('password','Password At least should be 4 characters').isLength({min: 4});
   req.check('mobile','Mobile Number Length Invalid').isLength({min: 10, max: 15});




   var errors = req.validationErrors();


   if(errors){
     req.session.errors = errors;
     req.session.success = false;
     res.redirect('/register');
   }else {
           req.session.errors = false;
           req.session.success = false;
           mongo.connect(url, function (err, client) {
               assert.equal(null, err);
               const db = client.db(dbName);
               db.collection('user').find({email: req.body.email}, {email: 1})
                   .toArray(function (err, result) {
                       assert.equal(null, err);
                       if (result.length > 0) {
                           console.log("verify Not unique Email");
                           res.render('register', {success: req.session.success, errors: req.session.errors, existEmail: true});
                       } else {
                           res.redirect('/insertUser');
                       }
                       client.close();
                   });
           });
       }

});


router.get('/insertUser', function (req, res, next) {

    req.session.success = true;

    mongo.connect(url, function (err,client) {
        assert.equal(null,err);
        const db = client.db(dbName);
        db.collection('user').insertOne(userDetail, function (err, result) {
            assert.equal(null, err);
            console.log("Inserted the customer Successfully");
            client.close();
            res.redirect('/register');
        });
    });
});

router.post('/signIn', function(req, res, next) {

    var email = req.body.email;
    var password = sha1(req.body.password);

    mongo.connect(url, function (err,client) {
        assert.equal(null, err);
        const db = client.db(dbName);
        db.collection('user').find(
            {email: email, password: password}
            ).toArray(function (err, result) {
            assert.equal(null, err);
            if (result.length == 1) {
                const user_detail = result[0];
                console.log(user_detail);
                console.log("User Entered details Correct");
                req.login(user_detail, function (err) {
                    res.redirect('/');
                });
            }else{
                console.log("User Invalid");
                res.render('login' , {error: true, layout : 'user'});
        }
        client.close();
        });
    });
});

router.get('/login', function(req, res, next) {
    if(req.isAuthenticated()){
        res.redirect('/');
    }else {
        res.render('login', {error: false, layout: 'user'});
    }

});

router.get('/logout', function(req, res, next) {
    req.logOut();
    req.session.destroy();
    res.redirect('/');
});

passport.serializeUser(function(user_detail, done) {
    done(null, user_detail);
});

passport.deserializeUser(function(user_detail, done) {
    done(null, user_detail);
});


function authenticationMiddleware () {
    return (req, res, next) => {
        //console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);

        if (req.isAuthenticated()) return next();
        res.redirect('/');
    }
}

module.exports = router;
