var mongodb = require('./db');

function Post(username, post, time) {
	this.user = username;
	this.post = post;
	
	if(time) {
		this.time = time;
	} else {
		this.time = new Date();
	}
}

module.exports = Post;

Post.prototype.save = function (callback) {
	var post = {
		user: this.user,
		post: this.post,
		time: this.time
	}
	
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		
		db.collection('posts', function(err, collection) {
			if (err) {
				db.close();
				return callback(err);
			} 
			collection.ensureIndex('user', function(err){});
			collection.insert(post, function(err, post) {
				db.close();
				callback(err, post);
			});
		});
	});
};

Post.get = function (username, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		
		db.collection('posts', function(err, collection) {
			if(err) {
				db.close();
				return callback(err);
			}
			var query = {};
			if (username) {
				query.user = username;
			}
			collection.find(query).sort({time:-1}).toArray(function(err, docs) {
				if(err) {
					callback(err, null);
					db.close();
				}
				
				var posts = [];
				docs.forEach(function(doc, index) {
					var post = new Post(doc.user, doc.post, doc.time);
					posts.push(post);
				});
				db.close();
				callback(null, posts);
			});
			
		});
	});
};