var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Issue = new Schema({
    title: String,
    subject: String,
    sendDate: Date,
    entryIds: Array,
    deleted: {type: Boolean, default: false}
});

module.exports = mongoose.model('Issue', Issue);