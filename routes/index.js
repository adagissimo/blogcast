
/*
 * GET home page.
 */
var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');

exports.index = function(req, res){
	Post.get(null, function(err, posts) {
		if (err) {
			posts = [];
		}
		
		res.render('index', { title: 'Home', posts:posts, layout:'layout'});
	});
};

exports.reg = function(req, res) {
	res.render('reg', {layout:'layout', title:'Register'});
};

exports.doReg = function(req, res) {
	if(req.body['password-repeat'] != req.body['password']) {
		req.flash('error', 'Passwords not match');
		return res.redirect('/reg');
	}
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');
	var newUser = new User({
		name:req.body.username,
		password:password
	});
	
	User.get(newUser.name, function(err, user) {
		if(user) err = 'User name already exists';
		if(err) {
			req.flash('error', err);
			return res.redirect('/reg');
		}
		
		newUser.save(function(err) {
			if(err) {
				req.flash('error', err);
				return res.redirect('/reg');
			}
			req.session.user = newUser;
			req.flash('success','Welcome');
			res.redirect('/');
		});
	});
};

exports.login = function(req, res) {
	res.render('login', {
		title: 'Log in'	,
		layout:'layout'
	});
};

exports.doLogin = function(req, res) {
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');
	
	User.get(req.body.username, function(err, user) {
		
		if (err) {
			req.flash('error', Object.prototype.toString.apply(err));
			return res.redirect('/login')
		}
	
		if(!user) {
			req.flash('error', 'User not exist');
			return res.redirect('/login');
		}
		
		if(user.password != password) {
			req.flash('error', 'Authentication failed');
			return res.redirect('/login');
		}
		
		req.session.user = user;
		req.flash('success', 'Successfully logged in');
		res.redirect('/');
	});
};

exports.logout = function(req, res) {
	req.session.user = null;
	req.flash('success', 'Successfully logged out');
	res.redirect('/');
};

exports.doPost = function (req, res) {
	var currentUser = req.session.user;
	var post = new Post(currentUser.name, req.body.post);
	post.save(function(err) {
		if(err) {
			req.flash('error', err);
			return res.redirect('/');
		}
		req.flash('success', 'Sent');
		res.redirect('/u/' + currentUser.name);
	});
};

exports.user = function (req, res) {
	User.get(req.params.user, function(err, user) {
		if (!user) {
			req.flash('error', 'User not exist');
			return res.redirect('/');
		}
		Post.get(user.name, function(err, posts) {
			if(err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			res.render('user', {
				title: user.name,
				posts: posts,
				layout: 'layout'
			});
		});
	});
};