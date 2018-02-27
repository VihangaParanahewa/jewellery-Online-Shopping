var express = require('express');
var router = express.Router();

var expressValidator = require('express-validator');
var passport= require('passport');

var mongo = require('mongodb').MongoClient;
var assert = require('assert');
var sha1 = require('sha1');



var url = 'mongodb://localhost:27017';

const dbName= 'jewellery';
/* GET home page. */
router.get('/', authenticationMiddleware(), function(req, res, next) {
    console.log(req.user);
    console.log(req.isAuthenticated());
    if(req.user.role == 'Admin'){
        res.render('index', { layout: 'admin' });
    }else{
        res.render('index', {layout: 'customer'});
    }

});

router.get('/home', function(req, res, next) {
    if(req.isAuthenticated()){
        res.redirect('/');
    }
    res.render('index');
});

router.get('/register', function(req, res, next) {
    if(req.isAuthenticated()) {
        res.redirect('/');
    }else
        {
            res.render('register', {success: req.session.success, errors: req.session.errors});
        }
});

router.post('/submit', function(req, res, next) {
   req.check('email','Invalid Password').isEmail();
   req.check('password','Password Not Match').equals(req.body.confirmPassword);
   req.check('password','At least should be 4 characters').isLength({min: 4});
   req.check('mobile','Mobile Number Length Invalid').isLength({min: 10, max: 15});

   var errors = req.validationErrors();

   if(errors){
     req.session.errors = errors;
     req.session.success = false;
   }else{
     req.session.success = true;
     var userDetail = {

         firstName : req.body.firstName,
         lastName : req.body.lastName,
         email : req.body.email,
         password : sha1(req.body.password),
         mobile : req.body.mobile,
         role : req.body.role

     };

     mongo.connect(url, function (err,client) {
         assert.equal(null,err);
         const db = client.db(dbName);
         db.collection('user').insertOne(userDetail, function (err, result) {
             assert.equal(null, err);
             console.log("Inserted the customer Successfully");
             client.close();
         });

     });

   }
   res.redirect('/register');
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
            }else {
                console.log("User Invalid");
                res.render('login' , {error: true});
        }
        client.close();
        });
    });
});

router.get('/login', function(req, res, next) {
    res.render('login', {error: false});
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
        console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);

        if (req.isAuthenticated()) return next();
        res.redirect('/home');
    }
}


module.exports = router;
