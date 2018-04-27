var express = require('express');
var router = express.Router();
var Product = require('../models/product');
var Cart = require('../models/cart');
var Order = require('../models/order');


router.get('/', function(req, res, next) {
    if (!req.session.cart) {
        return res.render('shopping-cart', {products: null, errMsg: false, noError: true});
    }
    var cart = new Cart(req.session.cart);
    res.render('shopping-cart', {products: cart.generateArray(), totalPrice: cart.totalPrice, layout: 'user'});
});

router.get('/add-to-cart/:id', function(req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    Product.findById(productId, function (err, product) {
        cart.add(product, product.id);
        req.session.cart = cart;
        res.redirect('/products/' + product.category);
    });
});

router.get('/reduce/:id', function(req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.reduceByOne(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});

router.get('/remove/:id', function(req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.removeItem(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});

router.get('/checkout', function(req, res, next) {
    if (!req.session.cart) {
        return res.redirect('/shopping-cart');
    }
    var cart = new Cart(req.session.cart);
    var errMsg = req.flash('error')[0];
    res.render('checkout', {totalPrice: cart.totalPrice, errMsg: errMsg, noError: !errMsg, layout: 'user'});
});

router.post('/checkout', function(req, res, next) {
    if (!req.session.cart) {
        return res.redirect('/shopping-cart');
    }
    var cart = new Cart(req.session.cart);

    var stripe = require("stripe")(
        "sk_test_cwfJWk0KEDTqbHDFZO9jNUTf"
    );

    stripe.charges.create({
        amount: cart.totalPrice * 100,
        currency: "LKR",
        source: req.body.stripeToken, // obtained with Stripe.js
        description: "Test Charge"
    }, function(err, charge) {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('/shopping-cart/checkout');
        }
        var order = new Order({
            user: req.user,
            cart: cart,
            address: req.body.address,
            name: req.body.name,
            paymentId: charge.id
        });
        order.save(function(err, result) {
            req.flash('success', 'Successfully bought product!');
            req.session.cart = null;
            res.render('shopping-cart', {products: req.session.cart, errMsg: req.flash('success')[0], noError: false});
        });
    });
});





module.exports = router;