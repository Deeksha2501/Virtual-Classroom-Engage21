const mongoose = require('mongoose');

const HomeworkSchema = new mongoose.Schema({
	studentId : {
		type:mongoose.Schema.Types.ObjectId, 
		ref: 'User'
	},
	
	checked : {
		type : Boolean,
		default : false
	},
	
	marks : {
		type : Number,
		default : -1
	},

	homeWorkFile : String,
	assignment_id :{
		type: mongoose.Schema.Types.ObjectId,
	    ref: 'Assignment'
	}
})

const Homework = mongoose.model('Homework', HomeworkSchema);

module.exports = Homework;