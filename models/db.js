var settings = require('../settings');
var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;

var Wrapper = function() {
}
Wrapper.prototype.open = Db.connect.bind(null, settings.dbUrl);

module.exports = new Wrapper();