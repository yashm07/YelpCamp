const express = require("express"),
	  router = express.Router(),
	  Campground = require("../models/campground"),
	  middleware = require("../middleware/index.js"),
	  NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

//INDEX - show all campgrounds
router.get("/", function(req, res){
	var perPage = 8;
	var pageQuery = parseInt(req.query.page);
	var pageNumber = pageQuery ? pageQuery : 1;
	var noMatch = null;
	if(req.query.search) {
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Campground.find({name: regex}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allCampgrounds) {
			Campground.count({name: regex}).exec(function (err, count) {
				if (err) {
					console.log(err);
					res.redirect("back");
				} else {
					if(allCampgrounds.length < 1) {
						noMatch = "No campgrounds match that query, please try again.";
					}
					res.render("campgrounds/index", {
						campgrounds: allCampgrounds,
						current: pageNumber,
						pages: Math.ceil(count / perPage),
						noMatch: noMatch,
						search: req.query.search
					});
				}
			});
		});
	} else {
		// get all campgrounds from DB
		Campground.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allCampgrounds) {
			Campground.count().exec(function (err, count) {
				if (err) {
					console.log(err);
				} else {
					res.render("campgrounds/index", {
						campgrounds: allCampgrounds,
						current: pageNumber,
						pages: Math.ceil(count / perPage),
						noMatch: noMatch,
						search: false
					});
				}
			});
		});
	}
});

// NEW route - Form for adding data
router.get("/new", middleware.isLoggedIn, (req, res) => {
	res.render("campgrounds/new");	
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
  // get data from form and add to campgrounds array
  var name = req.body.name;
  var image = req.body.image;
  var price = req.body.price;
  var desc = req.body.description;
  var num = req.body.number;
  var web = req.body.website;

  var author = {
	  id: req.user._id,
	  username: req.user.username
  }
  geocoder.geocode(req.body.location, function (err, data) {
	if (err || !data.length) {
		console.log(err);
	  req.flash('error', 'Invalid address');
	  return res.redirect('back');
	}
	var lat = data[0].latitude;
	var lng = data[0].longitude;
	var location = data[0].formattedAddress;
	var newCampground = {name: name, image: image, description: desc, price: price, author:author, location: location, lat: lat, lng: lng, number: num, website: web};
	// Create a new campground and save to DB
	Campground.create(newCampground, function(err, newlyCreated){
		if(err){
			console.log(err);
		} else {
			//redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
    });
  });
});

// SHOW route - Shows more info about one campground
router.get("/:id", (req, res) => {
	// 	find the campground with the provided ID
	Campground.findById(req.params.id).populate("comments likes").exec(function(err, foundCampground) {
		if(err || !foundCampground) {
			console.log(err);
			req.flash("error", "Campground not found");
			res.redirect("back");
		} else{
			console.log(foundCampground);
			// 	render show template with that campgrounds
			res.render("campgrounds/show", {campground:foundCampground});
		}
	});
});

// EDIT ROUTE 
router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
	Campground.findById(req.params.id, (err, foundCampground) => {
		res.render("campgrounds/edit", {campground: foundCampground});
	});
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
  geocoder.geocode(req.body.campground.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;
	  
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, campground) => {
		if(err){
			console.log(err);
			res.redirect("/campgrounds");
		} else {
			res.redirect("/campgrounds/" + campground._id);
		}
	});
  });
});

// DELETE CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, async(req, res) => {
  try {
    let foundCampground = await Campground.findById(req.params.id);
    await foundCampground.remove();
	req.flash("success", "Successfully deleted campground!");
    res.redirect("/campgrounds");
  } catch (error) {
    console.log(error.message);
    res.redirect("/campgrounds");
  }
});


// Campground Like Route
router.post("/:id/like", middleware.isLoggedIn, function (req, res) {
    Campground.findById(req.params.id, function (err, foundCampground) {
        if (err) {
            console.log(err);
            return res.redirect("/campgrounds");
        }

        // check if req.user._id exists in foundCampground.likes
        var foundUserLike = foundCampground.likes.some(function (like) {
            return like.equals(req.user._id);
        });

        if (foundUserLike) {
            // user already liked, removing like
            foundCampground.likes.pull(req.user._id);
        } else {
            // adding the new user like
            foundCampground.likes.push(req.user);
        }

        foundCampground.save(function (err) {
            if (err) {
                console.log(err);
                return res.redirect("/campgrounds");
            }
            return res.redirect("/campgrounds/" + foundCampground._id);
        });
    });
});

function escapeRegex(text){
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;