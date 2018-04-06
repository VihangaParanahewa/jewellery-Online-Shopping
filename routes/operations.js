var express = require('express');
var router = express.Router();

var expressValidator = require('express-validator');
var passport= require('passport');

var mongo = require('mongodb').MongoClient;
var assert = require('assert');
var sha1 = require('sha1');


var url = 'mongodb://localhost:27017';

const dbName= 'jewellery';


router.get('/', function(req, res, next) {
    res.render('addNewUser', {errors: false, success: false, layout : 'user'});
});

router.post('/addNewUser', function(req, res, next) {

    req.checkBody('firstName','First Name field Empty').notEmpty();
    req.checkBody('lastName','Last Name field Empty').notEmpty();
    req.check('email','Invalid Email').isEmail();
    req.check('password','Password Not Match').equals(req.body.confirmPassword);
    req.check('password','Password At least should be 4 characters').isLength({min: 4});
    req.check('mobile','Mobile Number Length Invalid').isLength({min: 10, max: 15});

    newUserDetail = {

        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: sha1(req.body.password),
        mobile: req.body.mobile,
        role: req.body.role,
        profileImage: "https://x1.xingassets.com/assets/frontend_minified/img/users/nobody_m.original.jpg"

    };

    var errors = req.validationErrors();


    if(errors) {
        req.session.errors = errors;
        req.session.success = false;
        res.render('addNewUser', {success: req.session.success, errors: req.session.errors, existEmail: false, layout : 'user'});
    } else {
        req.session.errors = false;
        req.session.success = false;
        mongo.connect(url, function (err, client) {
            assert.equal(null, err);
            const db = client.db(dbName);
            db.collection('user').find({email: req.body.email}, {email: 1})
                .toArray(function (err, result) {
                    assert.equal(null, err);
                    if (result.length > 0) {
                        console.log("verify Not unique New User's Email");
                        res.render('addNewUser', {success: req.session.success, errors: req.session.errors, existEmail: true, layout : 'user'});
                    } else {
                        res.redirect('/operations/insertNewUser');
                    }
                    client.close();
                });
        });

    }
});

router.get('/insertNewUser', function (req, res, next) {

    req.session.success = true;

    mongo.connect(url, function (err,client) {
        assert.equal(null,err);
        const db = client.db(dbName);
        db.collection('user').insertOne(newUserDetail, function (err, result) {
            assert.equal(null, err);
            console.log("Inserted the New User Successfully");
            client.close();
            res.render('addNewUser' , { success: req.session.success, errors: req.session.errors, existEmail: false, layout : 'user'});
        });

    });
});

router.get('/viewSystemUsers', function(req, res, next) {
    mongo.connect(url, function (err, client) {
        assert.equal(null, err);
        var dbo = client.db(dbName);
        dbo.collection("user").find(
        ).toArray(function (err, result) {
            assert.equal(null, err);
            res.render('viewSystemUsers', {result : result, layout: 'user'});
            client.close();
        });
    });
});


router.get('/viewAdminUsers', function(req, res, next) {
    mongo.connect(url, function (err, client) {
        assert.equal(null, err);
        var dbo = client.db(dbName);
        dbo.collection("user").find(
            {role : "Admin"}
        ).toArray(function (err, result) {
            assert.equal(null, err);
            res.render('viewSystemUsers', {result : result, layout: 'user'});
            client.close();
        });
    });
});


router.get('/viewCustomerUsers', function(req, res, next) {
    mongo.connect(url, function (err, client) {
        assert.equal(null, err);
        var dbo = client.db(dbName);
        dbo.collection("user").find(
            {role : "Customer"}
        ).toArray(function (err, result) {
            assert.equal(null, err);
            res.render('viewSystemUsers', {result : result, layout: 'user'});
            client.close();
        });
    });
});





module.exports = router;