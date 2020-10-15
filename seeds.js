const mongoose = require("mongoose"),
	  Campground = require("./models/campground"),
	  Comment = require("./models/comment");

const data = [
	{
		name: "Cloud's Rest",
		image: "https://images.pexels.com/photos/1061640/pexels-photo-1061640.jpeg?auto=compress&cs=tinysrgb&h=350",
		description: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)."


	},
	{
		name: "Desert Mesa",
		image: "https://images.pexels.com/photos/699558/pexels-photo-699558.jpeg?auto=compress&cs=tinysrgb&h=350",
		description: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)."
	},
	{
		name: "Canyon Floor",
		image: "https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg?auto=compress&cs=tinysrgb&h=350",
		description: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)."
	}
]

const seedDB = () => {
	// 	Remove all campgrounds 
	Campground.remove({}, (err) => {
		if(err){
			console.log(err);
		} 
		console.log("Removed campgrounds");
		// 	add a few campgrounds
		// data.forEach((seed) => {
		// 	Campground.create(seed, (err, campground) => {
		// 		if(err){
		// 			console.log(err);
		// 		} else {
		// 			console.log("added a campground!");
		// 		// 	create a comment
		// 			Comment.create(
		// 				{
		// 					text: "This place is great, but I wish there was internet",
		// 					author: "Homer"
		// 				}, (err, comment) => {
		// 					if(err){
		// 						console.log(err);
		// 					} else {
		// 						campground.comments.push(comment);
		// 						campground.save();
		// 						console.log("Created a new comment!");
		// 					}
		// 			});
		// 		}
		// 	});
		// });
	});
}

module.exports = seedDB