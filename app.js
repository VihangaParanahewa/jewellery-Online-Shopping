var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs  = require('express-handlebars');
var expressValidator = require('express-validator');
var expressSession= require('express-session');
var passport= require('passport');
var flash = require('connect-flash');
var LocalStrategy = require('passport-local').Strategy;
var MongoStore = require('connect-mongo')(expressSession);
var mongoose = require('mongoose');

var index = require('./routes/index');
var users = require('./routes/users');
var post = require('./routes/post');
var operations = require('./routes/operations');
var products = require('./routes/products');
var editProduct = require('./routes/editProduct');
var forgotPassword = require('./routes/forgotPassword');
var shoppingCart = require('./routes/shopping-cart');

var app = express();



mongoose.connect('mongodb://localhost/jewellery');

// view engine setup
app.engine('hbs',hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir:__dirname+'/views/layouts/'}));
app.set('view engine', 'hbs');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')))

app.use(expressSession({
    secret: 'foo',
    saveUninitialized: false ,
    resave: false,
    store: new MongoStore({
        mongooseConnection: mongoose.connection,
        storage: 'mongodb',
        instance: mongoose, // optional
        host: 'localhost', // optional
        port: 27017, // optional
        db: 'jewellery', // optional
        collection: 'session',
        expire: 14 * 24 * 60 * 60,

    })
}));

//app.use(expressSession({secret:'max' ,saveUninitialized: false ,resave: false}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(function (req,res,next) {
    res.locals.isAuthenticated = req.isAuthenticated();
    res.locals.session = req.session;
    if (req.isAuthenticated()){
        res.locals.user = req.user;
        if(req.user.role == 'Admin')
        res.locals.userRole= true;
    }
    next();
});

app.use('/', index);
app.use('/users', users);
app.use('/post', post);
app.use('/operations', operations);
app.use('/products', products);
app.use('/editProduct', editProduct);
app.use('/forgotPassword', forgotPassword);
app.use('/shopping-cart', shoppingCart);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
