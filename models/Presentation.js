var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('./User');

var Presentation = new Schema({
    title: String,
    desc: String,
    createdTimestamp: Date,
    modifiedTimestamp: Date,
    _creator: {type: Schema.Types.ObjectId, ref: 'User'}
    type: String,
    content: Mixed
});

module.exports = mongoose.model('Presentation', Presentation);
