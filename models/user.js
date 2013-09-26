var mongodb = require('./db');

function User(user) {
	this.name = user.name;
	this.password = user.password;
}
module.exports = User;

User.prototype.save = function(callback) {
	var user = {
		name: this.name,
		password: this.password
	};
	mongodb.open(function(err, db) {
		if(err) {
			return callback(err);
		}
		
		db.collection('users', function(err, collection) {
			if(err) {
				db.close();
				return callback(err);
			}
			collection.ensureIndex('name', {unique:true}, function(err){});
			collection.insert(user, function(err, user) {
				db.close();
				callback(err, user);
			});
		});
	});
}

User.get = function(username, callback) {
	mongodb.open(function(err, db) {
		if(err) return callback(err);
		db.collection('users', function(err, collection) {
			if(err) {
				mongo.close();
				return callback(err);
			}
			
			collection.findOne({name:username}, function(err, doc) {
				db.close();
				if(doc) {
					var user = new User(doc);
					callback(err, user);
				} else {
					callback(err, null);
				}
			});
		});
	});
}