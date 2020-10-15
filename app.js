require('dotenv').config();

const express    	= require("express"),
	  app        	= express(),
	  bodyParser 	= require("body-parser"),
	  mongoose   	= require("mongoose"),
	  flash 		= require("connect-flash"),
	  passport 		= require("passport"),
	  methodOverride = require("method-override"),
	  seedDB 		= require("./seeds.js"),
	  User 			= require("./models/user.js"),
	  Comment 		= require("./models/comment.js"),
	  LocalStrategy = require("passport-local"),
	  Campground 	= require("./models/campground.js");

// requiring routes
const commentRoutes    = require("./routes/comments"),
	  campgroundRoutes = require("./routes/campgrounds"),
	  indexRoutes 	   = require("./routes/index");
	
const url = process.env.DATABASEURL || "mongodb://localhost:27017/yelp_camp"
mongoose.connect(url, {useUnifiedTopology: true, useNewUrlParser: true});

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require('moment');
// seedDB(); // seeding the database 

// PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: process.env.SECRET,
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.success = req.flash("success");
	res.locals.error = req.flash("error");
	next();
});

app.use("/", indexRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds", campgroundRoutes);

app.listen(process.env.PORT || 3000, () => {
	console.log("The YelpCamp server is running!");
});