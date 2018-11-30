//dependecies
var express = require("express");
var session = require('express-session');
var bodyParser = require('body-parser');
var mysql = require("mysql");
var credentials = require("./credentials");
var qs = require("querystring");

var app = express();
var session;
// set up handlebars view engine
var handlebars = require('express-handlebars')
	.create({ defaultLayout:'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set("port", process.env.PORT || 3000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
  secret: 'cmps361supersecret',
  resave: true,
  saveUninitialized: false,
	//	secret: credentials.cookieSecret,
}));

app.use(function(req, res, next){
	// if there's a flash message, transfer
	// it to the context, then clear it

	res.locals.user = req.session.flash;
	delete req.session.flash;
	next();
});

//routes
app.get('/', function(req, res){
	res.render('home');
});

app.get('/about', function(req, res){
	res.render('about');
});

//Set the session user name to whatever the user has added.
app.post('/login',function(req,res){
//	req.session.username = req.body.username;
//	req.session.password = req.body.password;
	req.session.user = {
		name: req.body.username,
		password: req.body.password
	};
	console.log(req.session.user.name + ' logged in');
	res.redirect('/login');
});
/*
app.get('/',function(req,res){
	// Check if an user is set in the session.
	if(req.session.username) {
	    res.redirect('/about');
	}
	else {
	    res.render('/account');
	}
});
*/
app.get('/login',function(req,res){
  if(req.session.user.name) {
    res.send('<h1>Hello '+req.session.user.name+'</h1><a href="/logout">Logout</a>');
    res.end();
	} else {
		res.send('<h1>Please login first.</h1><a href="/account">Login</a>');
		res.end();
	}
});

app.get('/logout',function(req,res){
	// if the user logs out, destroy all of their individual session
	// information
	console.log(req.session.user.name + ' logged out');
	req.session.destroy();
	res.redirect('/account');
});

app.get('/account', function(req, res){
	res.render('account', { csrf: "CSRF token goes here" });
});

/*
app.post("/process", function(req, res){
   if(true || req.xhr || req.accepts("json,html")==="json"){
//   console.log(JSON.stringify(req.body));
     res.send({
        success: true
        });
        }
  else{
//    res.redirect(303,"/welcome");
   }
});
*/
function sendResponse(req, res, data) {
  res.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
  res.end(JSON.stringify(data));
}

app.get('/storage', function(req, res) {
  var conn = mysql.createConnection(credentials.connection);
  // connect to database
  conn.connect(function(err) {
    if (err) {
      console.error("ERROR: cannot connect: " + e);
      return;
    }
    // query the database
    conn.query("SELECT * FROM UNITS", function(err, rows, fields) {
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

// static pages
app.use(express.static(__dirname + '/public'));

/*
function addUser(req, res) {
  var body = "";
  req.on("data", function (data) {
    body += data;
    // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
    if (body.length > 1e6) {
      // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
      req.connection.destroy();
    }
  });
  req.on("end", function () {
    var injson = JSON.parse(body);
    var conn = mysql.createConnection(credentials.connection);
    // connect to database
    conn.connect(function(err) {
      if (err) {
        console.error("ERROR: cannot connect: " + e);
        return;
      }
      // query the database
      conn.query("INSERT INTO USERS (NAME) VALUE (?)", [injson.name], function(err, rows, fields) {
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
        res.send(req, res, outjson);
      });
      conn.end();
    });
  });
}
*/

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
