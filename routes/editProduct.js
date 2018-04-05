var express = require('express');
var router = express.Router();

const multer = require('multer');

const storage = multer.diskStorage({
    destination : function(req,file,cb){
        cb(null,'public/images/');
    },
    filename : function (req,file,cb) {
        cb(null,file.fieldname + '-' + Date.now() + '.jpg');
        attachFile = true;
    }

});

attachFile = false;
updateAllDetail = false;

const upload = multer({storage : storage});

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

router.get('/edit/:id', function(req, res, next) {
    var productId = parseInt(req.params.id);

    mongo.connect(url, function (err, client) {
        assert.equal(null, err);
        var dbo = client.db(dbName);
        dbo.collection("products").find(
            {productId : productId}
        ).toArray(function (err, result) {
            assert.equal(null, err);
            res.render('editProduct', {result : result, layout: 'user'});
            client.close();
        });
    });

});



router.post('/updateProduct', upload.single('productImage'), function(req, res, next) {
    if(attachFile) fileAuthentication (req);
    req.check('name', 'Product Name Filed Empty').notEmpty();
    req.check('quantity', 'Product Quantity Not Selected').notEmpty();
    req.check('price', 'Product Price Not Decided').notEmpty();

    var errors = req.validationErrors();

    var str = req.body.category;

    productCategory = str.toLowerCase();
    productIdentity = parseInt(req.body.productId);

    updateDetail = {
        $set: {
            name : req.body.name,
            category : req.body.category,
            quantity : req.body.quantity,
            price : req.body.price
        }
    };

    if (errors) {
        req.session.errors = errors;
        res.render('editProduct', {errors : req.session.errors});
    } else {
        req.session.errors = false;

        mongo.connect(url, function(err, client) {
            assert.equal(null, err);
            var dbo = client.db(dbName);
            if(updateAllDetail){
                dbo.collection("products").updateMany(
                    {  productId: productIdentity},updateAllDetail
                    , function(err, rest) {
                        assert.equal(null, err);
                        console.log(rest.result.nModified + " document(s) updated");
                        client.close();
                        updateAllDetail = false;
                        res.redirect('/products/' + productCategory);
                    });
            } else if (updateDetail){
                dbo.collection("products").updateMany(
                    {  productId: productIdentity},updateDetail
                    , function(err, rest) {
                        assert.equal(null, err);
                        console.log(rest.result.nModified + " document(s) updated");
                        client.close();
                        res.redirect('/products/' + productCategory);
                    });
            }

        });

    }
});


function fileAuthentication (req) {
    updateAllDetail = {
        $set: {
            name : req.body.name,
            category : req.body.category,
            quantity : req.body.quantity,
            productImage : '/images/'+ req.file.filename,
            price : req.body.price
        }
    };
    attachFile = false;

}




module.exports = router;