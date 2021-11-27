const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
	title: String,
    description: String,
    fileName : String,

    classId: {
       type: mongoose.Schema.Types.ObjectId,
	   ref: 'Class'
    },
    
    homework : [{
       type: mongoose.Schema.Types.ObjectId,
	   ref: 'Homework'
    }]
}, {timestamps: true})

const Assignment = mongoose.model('Assignment', AssignmentSchema);

module.exports = Assignment;