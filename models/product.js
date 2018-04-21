var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    productId: {type: Number, required: true},
    name: {type: String, required: true},
    category: {type: String, required: true},
    quantity: {type: Number, required: true},
    productImage: {type: String, required: true},
    price: {type: Number, required: true}
});

module.exports = mongoose.model('Product', schema);