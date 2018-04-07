var express = require('express');
var router = express.Router();
var twilio = require('twilio')('ACc8ab9018524c49a40a4d1d7683c3adab',
    '32c40d3ed7476487d940ff834f030f0d');

var expressValidator = require('express-validator');
var passport= require('passport');

var mongo = require('mongodb').MongoClient;
var assert = require('assert');
var sha1 = require('sha1');
/*pinNum = 0;
verifiedUserMobile = 0;
verifiedEmail = 0;*/



var url = 'mongodb://localhost:27017';

const dbName= 'jewellery';



router.get('/', function(req, res, next) {
    res.send('The Email you entered Already Not A user in this System');

});

router.post('/confirmUser', function(req, res, next) {
    req.check('email','Invalid Email').isEmail();
    var errors = req.validationErrors();
    if(errors) {
        req.session.errors = errors;
        res.render('message', {errors: req.session.errors, layout: 'user'});
    } else {
        req.session.errors = false;
        mongo.connect(url, function (err, client) {
            assert.equal(null, err);
            const db = client.db(dbName);
            db.collection('user').find({email: req.body.email}, {email: 1 , mobile: 1})
                .toArray(function (err, result) {
                    assert.equal(null, err);
                    if (result.length == 1) {
                        console.log("verified the User");
                        if( result[0].mobile.charAt( 0 ) === '0' )
                            req.session.verifiedUserMobile = result[0].mobile.slice( 1 );
                        req.session.verifiedEmail = result[0].email;
                        res.redirect('/forgotPassword/sendSMS');
                    } else {
                        res.render('message', {errors: false, layout:'user'});
                    }
                    client.close();
                });


        });
    }

});

router.get('/sendSMS', function (req, res, next) {
    req.session.pinNum = Math.floor(100000 + Math.random() * 900000);
    console.log(req.session.pinNum);
    twilio.messages.create({
        to: '+94'+ req.session.verifiedUserMobile,
        from: '+12156189566',
        body: 'Code: '+ req.session.pinNum,
    }, function(err, data){
        if(err) {
            console.log(err);
            res.redirect('/');
        } else {
            console.log(data);
            res.render('codeValidation', {layout: 'user'});
        }

    });

});


router.post('/codeValidation', function (req, res, next) {
    req.checkBody('code','code not entered').notEmpty();
    req.check('code','Code Not match').equals(req.session.pinNum.toString());
    var errors = req.validationErrors();
    console.log(req.session.pinNum);
    console.log(req.session.verifiedUserMobile);
    console.log(req.session.verifiedEmail);
    if (errors){
        req.session.errors = errors;
        res.render('message', {errors: req.session.errors, layout: 'user'});
    } else {
        res.render('newPassword', {layout: 'user'});
    }

});

router.post('/replaceNewPassword', function (req, res, next) {
    req.check('password','Password At least should be 4 characters').isLength({min: 4});
    req.check('password','Password Not Match').equals(req.body.confirmPassword);
    req.check('password','New Password not entered').notEmpty();

    var errors = req.validationErrors();

    var updatePassword = {
        $set: {
            password: sha1(req.body.password)
        }
    };

    if (errors){
        req.session.errors = errors;
        res.render('message', {errors: req.session.errors, layout: 'user'});
    } else {
        mongo.connect(url, function (err, client) {
            assert.equal(null, err);
            const db = client.db(dbName);
            db.collection("user").updateMany(
                {  email: req.session.verifiedEmail},updatePassword
                , function(err, rest) {
                    assert.equal(null, err);
                    console.log(rest.result.nModified + " document(s) updated");
                    client.close();
                    res.render('login', {success: false, errors: false, existEmail: false, layout : 'user'});
                });
        });
    }
});



module.exports = router;