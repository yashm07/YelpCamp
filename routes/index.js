const express = require("express"),
	  router = express.Router(),
	  passport = require("passport"),
	  User = require("../models/user"),
	  Campground = require("../models/campground"),
	  nodemailer = require("nodemailer"),
	  crypto = require("crypto");

const async = require("async");

// ======================
// LOGIN/SIGNUP ROUTES
// ======================

// root route
router.get("/", (req, res) => {
	res.render("landing");
	console.log(process.env.GMAILPW);
});

// show register form
router.get("/register", (req, res) => {
	res.render("register", {page: "register"});
});

// handle sign up logic
router.post("/register", (req, res) => {
	const newUser = new User(
		{
			username: req.body.username,
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			email: req.body.email,
			avatar: req.body.avatar,
			aboutMe: req.body.aboutMe
		});
	if(req.body.admincode === "secretcode123"){
		newUser.isAdmin = true;
	}
	User.register(newUser, req.body.password, (err, user) => {
		if(err){
			req.flash("error", err.message);
			return res.redirect("/register");
		}
		passport.authenticate("local")(req, res, () => {
			req.flash("success", "Welcome to YelpCamp " + user.username + "!");
			res.redirect("/campgrounds");
		});
	});
})

// show login form
router.get("/login", (req, res) => {
	res.render("login", {page: "login"});
});

// handling login logic
router.post("/login", passport.authenticate("local", 
	{
		successRedirect: "/campgrounds",
		failureRedirect: "/login"
	}));

// logout route
router.get("/logout", (req, res) => {
	req.logout();
	req.flash("success", "You have logged out!");
	res.redirect("/campgrounds");
});

// ======================
// RESET PASSWORD ROUTES
// ======================
router.get("/forgot", (req, res) => {
	res.render("forgot");
});

router.post("/forgot", (req, res, next) => {
	async.waterfall([
		(done) => {
			crypto.randomBytes(30, (err, buf) => {
				var token = buf.toString("hex");
				done(err, token);
			});
		},
		(token, done) => {
			User.findOne({email: req.body.email}, (err, user) => {
				if(!user){
					req.flash("error", "No account with that email address exists.");
					return res.redirect("/forgot");
				}
				
				user.resetPasswordToken = token;
				user.resetPasswordExpires = Date.now() + 1800000; // 30 minutes
				
				user.save((err) => {
					done(err, token, user);
				});
			});
		},
		(token, user, done) => {
			var smtpTransport = nodemailer.createTransport({
				service: "Gmail",
				auth: {
					user: "ymatharu7@gmail.com",
					pass: process.env.GMAILPW
				}
			});
			var mailOptions = {
				to: user.email,
				from: "ymatharu7@gmail.com",
				subject: "YelpCamp Password Reset",
				text: "You are receiving this because you (or someone else) have requested the reset of the password.\n\n" + "Please click on the following link, or paste this into your broswer to complete the process\n\n" + "https://wbdyelpcamp.run-us-west2.goorm.io/reset/" + token + "\n\n" + "If you did not request this, please ignore this email and your password will remain unchanged."
			};
			smtpTransport.sendMail(mailOptions, (err) => {
				if(err){
					req.flash("error", "E-mail did not send. Check email settings to allow websites to send emails to you.");
					res.redirect("/forgot");
				} else {
					req.flash("success", "An e-mail has been sent to " + user.email + " with further instructions.");
				done(err, "done");
				}
			});
		}
	], (err) => {
		if(err) return next(err);
		res.redirect("/forgot");
	});
});

router.get("/reset/:token", (req, res) => {
	User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, (err, user) => {
		if(!user){
			req.flash("error", "Password reset token is invalid or has expired");
			return res.redirect("/forgot");
		}
		res.render("reset", {token: req.params.token});
	});
});

router.post("/reset/:token", (req, res) => {
	async.waterfall([
		(done) => {
			User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, (err, user) => {
				if(!user){
					req.flash("error", "Password reset token is invalid or has expired");
					return res.redirect("back");
				}
				if(req.body.password === req.body.confirm){
					user.setPassword(req.body.password, (err) => {
						user.resetPasswordToken = undefined;
						user.resetPasswordExpires = undefined;
						
						user.save((err) => {
							req.logIn(user, (err) => {
								done(err, user);
							});
						});
					})
				} else {
					req.flash("error", "Passwords do not match.");
					return res.redirect("back");
				}
			});
		},
		(user, done) => {
			var smtpTransport = nodemailer.createTransport({
				service: "Gmail",
				auth: {
					user: "ymatharu7@gmail.com",
					pass: process.env.GMAILPW
				}
			});
			var mailOptions = {
				to: user.email,
				from: "ymatharu7@gmail.com",
				subject: "Your password has been changed",
				text: "Hello, \n\n" + "This is a confirmation email that the password for your account " + user.email + " has just been changed."
			};
			smtpTransport.sendMail(mailOptions, (err) => {
				req.flash("success", "Success! Your password has been changed.");
				done(err);
			});
		}
], (err) => {
		req.flash("error", "Something went wrong.");
		res.redirect("/campgrounds");
	});
});

// ======================
// USER PROFILES ROUTES
// ======================

router.get("/users/:id", (req, res) => {
	User.findById(req.params.id, (err, foundUser) => {
		if(err){
			req.flash("error", "Something went wrong!");
			res.redirect("/");
		}
		Campground.find().where("author.id").equals(foundUser._id).exec((err, campgrounds) => {
			if(err){
				req.flash("error", "Something went wrong!");
				res.redirect("/");
			}
			res.render("users/show", {user: foundUser, campgrounds: campgrounds, page: "account"});
		});
	});
});

module.exports = router;