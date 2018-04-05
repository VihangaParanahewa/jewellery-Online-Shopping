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
        mongo.connect(url, function (err, client) {
            assert.equal(null, err);
            var dbo = client.db(dbName);
            dbo.collection("products").find(
                {category : "Ring"}
            ).toArray(function (err, result) {
                assert.equal(null, err);
                res.render('products', {result : result, layout: 'user'});
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
            res.render('products', {result : result, layout: 'user'});
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
            res.render('products', {result : result, layout: 'user'});
            client.close();
        });
    });
});


router.get('/viewPhoto/images/:id', function(req, res, next) {

    var imagePath = req.params.id;
    console.log(imagePath);
    res.render('viewPhoto', {image: imagePath, layout: 'user'});
});






module.exports = router;