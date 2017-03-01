var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var APISchema   = new Schema({
	name: String
});

module.exports = mongoose.model('API', APISchema);