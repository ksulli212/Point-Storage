var express = require("express");

var app = express();

// set up handlebars view engine
var handlebars = require('express-handlebars')
	.create({ defaultLayout:'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set("port", process.env.PORT || 3000);

app.get('/', function(req, res){
	res.render('home');
});

app.get('/about', function(req, res){
	res.render('about');
});


app.get('/account', function(req, res){
	res.render('account', { csrf: "CSRF token goes here" });
});


app.get('/storage', function(req, res){
	res.render('storage',{
		small: [
			{ sSize: "5' x 5' x 8'", sDesc: "Up to 200 cubic feet of space", sRecm: "Boxes, small furniture, and miscellaneous items"},
			{ sSize: "5' x 10' x 8'", sDesc: "Up to 400 cubic feet of space", sRecm: "Contents of a studio or small 1 bedroom apartment"},
			{ sSize: "5' x 15' x 8'", sDesc: "Up to 600 cubic feet of space", sRecm: "Contents of a 1 bedroom apartment, or garage items"},
    ],
		medium:[
			{ mSize: "10' x 10' x 8'", mDesc: "Up to 800 cubic feet of space", mRecm: "Contents of a 2 bedroom apartment, or household equipment"},
			{ mSize: "10' x 15' x 8'", mDesc: "Up to 1,200 cubic feet of space", mRecm: "Contents of a 3 bedroom house or full apartment"},
		],
		large: [
			{ lSize: "10' x 20' x 8'", lDesc: "Up to 1,600 cubic feet of space.", lRecm: "Contents of a 4 bedroom house or a full garage"},
			{ lSize: "10' x 25' x 8'", lDesc: "Up to 2,000 cubic feet of space", lRecm: "Contents of a 4+ bedroom house or a large garage"},
			{ lSize: "10' x 30' x 8'", lDesc: "Up to 2,400 cubic feet of space", lRecm: "Contents of a 5 bedroom house, large furniture & household equipment"},
		],
	});
});

// static pages
app.use(express.static(__dirname + '/public'));

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
