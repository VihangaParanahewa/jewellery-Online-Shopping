var express = require('express');
var router = express.Router();

const multer = require('multer');

const storage = multer.diskStorage({
    destination : function(req,file,cb){
        cb(null,'public/images/');
    },
    filename : function (req,file,cb) {
        cb(null,file.fieldname + '-' + Date.now() + '.jpg');
    }

});


const uploadPost = multer({storage : storage});


var expressValidator = require('express-validator');
var passport= require('passport');

var mongo = require('mongodb').MongoClient;
var assert = require('assert');



var url = 'mongodb://localhost:27017';

const dbName= 'jewellery';
//productId = false;


router.get('/', function(req, res, next) {
    res.render('createPost', { errors : false , success : false});
});


router.post('/publish', uploadPost.single('productImage'), function(req, res, next) {

    req.check('name', 'Product Name Filed Empty').notEmpty();
    req.check('quantity', 'Product Quantity Not Selected').notEmpty();
    //req.check('productImage', 'Product Image Not Selected ').notEmpty();
    req.check('price', 'Product Price Not Decided').notEmpty();

        name = req.body.name;
        category = req.body.category;
        quantity = req.body.quantity;
        productImage = '/images/'+ req.file.filename;
        price = req.body.price;

    var errors = req.validationErrors();

    if(errors){
        req.session.errors = errors;
        res.render('createPost' , { errors : req.session.errors , success: false});
    } else {
        mongo.connect(url, function(err, client) {
            assert.equal(null, err);
            var dbo = client.db(dbName);
            dbo.collection("counters").updateMany(
                { _id: "userid" },
                {$inc:  {seq: 1}  });
            dbo.collection("counters").find(
                { _id: "userid" }
            ).toArray(function (err, result) {
                    assert.equal(null, err);
                    console.log(result[0].seq);
                    productId = result[0].seq;
                    client.close();
                });
            res.redirect('/post/continue');
        });
    }
});


router.get('/continue', function(req, res, next) {

    mongo.connect(url, function(err, client) {
        assert.equal(null, err);
        var dbo = client.db(dbName);
        dbo.collection("products").insertOne(
            {
                productId : productId,
                name: name,
                category : category,
                quantity : quantity,
                productImage : productImage,
                price : price

            }, function (err, result) {
            assert.equal(null, err);
            console.log("Inserted the New Product Successfully");
            client.close();
        });
    });
    res.render('createPost' , { errors : false , success : true});

});

module.exports = router;