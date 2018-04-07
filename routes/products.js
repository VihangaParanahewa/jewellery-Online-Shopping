var express = require('express');
var router = express.Router();
var twilio = require('twilio')('ACc8ab9018524c49a40a4d1d7683c3adab',
    '32c40d3ed7476487d940ff834f030f0d');

var expressValidator = require('express-validator');
var passport= require('passport');

var mongo = require('mongodb').MongoClient;
var assert = require('assert');
var sha1 = require('sha1');


var url = 'mongodb://localhost:27017';

const dbName= 'jewellery';



router.get('/', function(req, res, next) {
    res.send('respond with a resource');

});


router.get('/ring', function(req, res, next) {
        mongo.connect(url, function (err, client) {
            assert.equal(null, err);
            var dbo = client.db(dbName);
            dbo.collection("products").find(
                {category : "Ring"}
            ).toArray(function (err, result) {
                assert.equal(null, err);
                res.render('products', {result : result, productType : result[0].category, layout: 'user'});
                client.close();
            });
        });
    });


router.get('/necklace', function(req, res, next) {
    mongo.connect(url, function (err, client) {
        assert.equal(null, err);
        var dbo = client.db(dbName);
        dbo.collection("products").find(
            {category : "Necklace"}
        ).toArray(function (err, result) {
            assert.equal(null, err);
            res.render('products', {result : result, productType : result[0].category, layout: 'user'});
            client.close();
        });
    });
});

router.get('/earring', function(req, res, next) {
    mongo.connect(url, function (err, client) {
        assert.equal(null, err);
        var dbo = client.db(dbName);
        dbo.collection("products").find(
            {category : "Earring"}
        ).toArray(function (err, result) {
            assert.equal(null, err);
            res.render('products', {result : result, productType : result[0].category, layout: 'user'});
            client.close();
        });
    });
});


router.get('/viewPhoto/images/:id', function(req, res, next) {

    var imagePath = req.params.id;
    console.log(imagePath);
    res.render('viewPhoto', {image: imagePath, layout: 'user'});
});

router.get('/deleteProduct/:id/:category', function(req, res, next) {

    var productId = parseInt(req.params.id);
    var str = req.params.category;
    productCategory = str.toLowerCase();
    console.log(productId);
    mongo.connect(url, function (err, client) {
        assert.equal(null, err);
        var dbo = client.db(dbName);
        dbo.collection("products").deleteOne({productId: productId}, function (err, rest) {
            assert.equal(null, err);
            console.log(rest.result.n+" document deleted");
            client.close();
            res.redirect('/products/' + productCategory);
        });

    });
});


router.get('/sendSMS', function (req, res, next) {
        twilio.messages.create({
        to: '+94719364276',
        from: '+12156189566',
        body: 'Hello Vihanga, How Are You..?'
    }, function(err, data){
        if(err) {
            console.log(err);
        } else {
            console.log(data);
            res.redirect('/');
        }

    });

});
module.exports = router;