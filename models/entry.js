var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Entry = new Schema({
    status: String,
    title: String,
    description: String,
    descriptionIsQuote: {type: Boolean, default: false},
    paid: {type: Boolean, default: false},
    pdf: {type: Boolean, default: false},
    extraInfo: String,
    url: String,
    domain: String,
    author: String,
    authorUrl: String,
    deleted: {type: Boolean, default: false}
});

module.exports = mongoose.model('Entry', Entry);