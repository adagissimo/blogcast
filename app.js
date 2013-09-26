
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');
var partials = require('express-partials');
var flash = require('connect-flash');
var fs = require('fs');
var accessLogfile = fs.createWriteStream('access.log', { flags:'a'});
var errorLogfile = fs.createWriteStream('error.log', {flags:'a'});

var app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
if (app.get('env') == 'development') {
	console.log('Development environment, log output to console.');
	app.use(express.logger('dev'));	
} else if (app.get('env') == 'production'){
	console.log('Production environment, log output to console.');
	app.use(express.logger({stream:accessLogfile}));
}
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
	secret: settings.cookieSecret,
	store: new MongoStore({
		db:settings.db,
		url:settings.dbUrl + '/MongoSession'
		}) 
}));
app.use(partials());
app.use(flash());
app.use(function(req, res, next) {
	res.locals.user = req.session.user;
	res.locals.error = req.flash('error');
	res.locals.success = req.flash('success');
	next();
});
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

if ('development' == app.get('env')) {
  app.use(express.errorHandler());
} else if ('production' == app.get('env')) {
	app.use(function (err, req, res, next) {
		var meta = '[' + new Date() + ']' + req.url + '\n';
		errorLogfile.write(meta + err.stack + '\n');
		next();
	});
}

app.get('/', routes.index);
app.get('/u/:user', routes.user);
app.get('/reg', routes.reg);
app.post('/reg', routes.doReg);
app.get('/login', checkNotLogin);
app.get('/login', routes.login);
app.post('/login', checkNotLogin);
app.post('/login', routes.doLogin);
app.get('/logout', checkLogin);
app.get('/logout', routes.logout);
app.post('/post', checkLogin);
app.post('/post', routes.doPost);
app.get('/u/:user', routes.user);

if (!module.parent) {
	start();
}

function start() {
	http.createServer(app).listen(app.get('port'), function(){
	  console.log('Express server listening on port ' + app.get('port') + " in " + app.get('env') + " mode.");
	  console.log('(pid:' + process.pid + ')');
	});
}

function checkLogin(req, res, next) {
	if (!req.session.user) {
		req.flash('error', 'Please log in');
		return res.redirect('/login');
	}
	next();
}

function checkNotLogin(req, res, next) {
	if (req.session.user) {
		req.flash('error', 'Already logged in');
		return res.redirect('/');
	}
	next();
}

exports.startServer = start;