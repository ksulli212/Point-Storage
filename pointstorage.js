//dependecies
var express = require("express");
var session = require('express-session');
var mysql = require("mysql");
var credentials = require("./credentials.js");
var qs = require("querystring");

var app = express();
var session;
// set up handlebars view engine
var handlebars = require('express-handlebars')
	.create({ defaultLayout:'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set("port", process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(session({
//secret: 'cmps361supersecret',
  resave: false,
  saveUninitialized: false,
	secret: credentials.cookieSecret,
}));

app.use(function(req, res, next){
	// if there's a flash message, transfer
	// it to the context, then clear it
	res.locals.flash = req.session.flash;
	//delete req.session.flash;
	next();
});

//routes
app.get('/', function(req, res){
	// If session exists, redirect to...
	if(req.session.user) {
		res.redirect('/storage');
	}
 // IF not, stay in the home page
	else {
		res.render('home');
	}
});

var counter = 0;

//Set the login session
app.post('/login',function(req,res){
	req.session.user = {
		name: req.body.username,
		password: req.body.password
	};
	res.redirect('/login');
});

app.get('/login', function(req, res) {

	var conn = mysql.createConnection(credentials.connection);

	var injson = req.session.user.name;

  // connect to database
  conn.connect(function(err) {
    if (err) {
      console.error("ERROR: cannot connect: " + e);
      return;
    }
    // query the database

    conn.query("SELECT * FROM Customer WHERE FirstName = ? ", [injson], function(err, rows, fields) {
      // build json result object
      var outjson = {};
      if (err) {
        // query failed
        outjson.success = false;
        outjson.message = "Query failed: " + err;
      }
      else {
        // query successful
        outjson.success = true;
        outjson.message = "Logged in as: " + injson;
        outjson.data = rows;
				counter += 1;
				console.log(req.session.user.name + ' logged in.   ' + counter + ' Users logged in.');
      }
      // return json object that contains the result of the query
    //  sendResponse(req, res, outjson);
	  	res.render('login', { login: outjson });

    });
    conn.end();
  });
});

app.get('/account', function(req, res){
	// If session exists, keep user in their profile page...login.handlebars
	if(req.session.user) {
		res.redirect('/login');
	}
 // If not, render login page...account.hadlerbars
	else {
		res.render('account');
	}
});

app.get('/logout',function(req,res){
	// if the user logs out, destroy all of their individual session
	// information
	counter -= 1;
	console.log(req.session.user.name + ' logged out.  ' + counter + ' Users logged in.');
	req.session.destroy();
	res.redirect('/account');
});

app.get('/storage', function(req, res) {
  var conn = mysql.createConnection(credentials.connection);
  // connect to database
  conn.connect(function(err) {
    if (err) {
      console.error("ERROR: cannot connect: " + e);
      return;
    }
    // query the database
    conn.query("SELECT * FROM Units", function(err, rows, fields) {
      // build json result object
      var outjson = {};
      if (err) {
        // query failed
        outjson.success = false;
        outjson.message = "Query failed: " + err;
      }
      else {
        // query successful
        outjson.success = true;
        outjson.message = "Query successful!";
        outjson.data = rows;
      }
      // return json object that contains the result of the query
    //  sendResponse(req, res, outjson);
	  	res.render('storage', { storage: outjson });

    });
    conn.end();
  });
});


app.get('/register', function(req, res) {
	if(req.session.user) {
		res.redirect('/login');
	}
 // If not, render login page...account.hadlerbars
	else {
		res.render('register');
	}
});

app.post('/register', function (req, res) {

	var conn = mysql.createConnection(credentials.connection);

  var injson = {
		"FirstName": req.body.firstname,
		"LastName":  req.body.lastname,
		"Address":  req.body.address,
		"City":  req.body.city,
		"State":  req.body.state,
		"Zip":  req.body.zip,
		"Phone":  req.body.phone
	}

  // connect to database
  conn.connect(function(err) {
    if (err) {
      console.error("ERROR: cannot connect: " + e);
      return;
    }
    // query the database
    conn.query("INSERT INTO Customer SET ?", injson, function(err, rows, fields) {
      // build json result object
      var outjson = {};
      if (err) {
        // query failed
        outjson.success = false;
        outjson.message = "Query failed: " + err;
      }
      else {
        // query successful
        outjson.success = true;
        outjson.message = "Query successful!";
      }
      // return json object that contains the result of the query
      res.redirect('/account');
    });
    conn.end();
  });
});


// 404 catch-all handler (middleware)
app.use(function(req, res, next){
	res.status(404);
	res.render('404');
});

// 500 error handler (middleware)
app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500);
	res.render('500');
});

app.listen(app.get("port"), function(){
	console.log( "Express started on http://localhost:" +
		app.get("port") + "; press Ctrl-C to terminate." );
});
