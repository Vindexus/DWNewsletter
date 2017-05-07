var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Entry = new Schema({
    status: String,
    title: String,
    description: String,
    descriptionIsQuote: Boolean,
    paid: Boolean,
    pdf: Boolean,
    extraInfo: String,
    url: String,
    domain: String,
    author: String,
    authorUrl: String
});

module.exports = mongoose.model('Entry', Entry);