const express = require("express"),
	  router = express.Router({mergeParams: true}),
	  Campground = require("../models/campground"),
	  Comment = require("../models/comment"),
	  middleware = require("../middleware/index.js");

// COMMENTS CREATE
router.post("/", middleware.isLoggedIn, (req, res) => {
	Campground.findById(req.params.id, (err, campground) => {
		if(err){
			req.flash("error", "Something went wrong!");
			console.log(err);
		} else {
			Comment.create(req.body.comment, (err, comment) => {
				if(err){
					console.log(err);
				} else {
				// add username and id to comment
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
				// save comment
					comment.save();
					campground.comments.push(comment);
					campground.save();
					req.flash("success", "Successfully added comment!");
					res.redirect("/campgrounds/" + campground._id);
				}
			});
		}
	});
});


// COMMENTS UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
		if(err){
			console.log(err);
			res.redirect("back");
		} else {
			res.redirect("/campgrounds/" + req.params.id);
		}
	})
});

// COMMENTS DELETE
router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
	Comment.findByIdAndRemove(req.params.comment_id, (err) => {
		if(err){
			console.log(err);
			res.redirect("back");
		} else {
			req.flash("success", "Successfully deleted comment!");
			res.redirect("/campgrounds/" + req.params.id);
		}
	})
});

module.exports = router;