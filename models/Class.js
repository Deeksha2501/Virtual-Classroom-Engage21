const mongoose = require('mongoose');

//------------ ClassITUTE Schema ------------//
const ClassSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  // class_id :{
  //   type: String,
  //   required : true
  // },

  inst : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Inst"
  },

  faculty : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "User"
  },
  
  students : [{
      type : mongoose.Schema.Types.ObjectId,
      ref : "User"
  }],

  batch: Number,
  branch: String,

  assignments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment'
 }],

 discuss_id : {
   type : mongoose.Schema.Types.ObjectId,
   ref : "Discuss"
 },
 image_url : {
   type : String,
   default : "https://www.gstatic.com/classroom/themes/img_cycling.jpg"
 },

}, { timestamps: true });

const Class = mongoose.model('Class', ClassSchema);

module.exports = Class;