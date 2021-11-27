const mongoose = require('mongoose');

//------------ User Schema ------------//
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  admin: {
    type: Boolean,
    default: false
  },
  inst:{
    type : mongoose.Schema.Types.ObjectId,
    ref : "Inst"
  },
  role:{
    type:String,
    default: 'student',
    require : true
  },
  batch: Number,
  branch: String,
  
  resetLink: {
    type: String,
    default: ''
  },
  
  classes : [{
    type : mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }],

  assignments: [{
    _id: {
      type : mongoose.Schema.Types.ObjectId,
      ref: 'Class'
    }, 
    submitted: {
      type: Boolean,
      default: false
    },
    marks: {
      type: Number,
      default: -1
    }
  }],
  profileImage : String

}, { timestamps: true });



const User = mongoose.model('User', UserSchema);

module.exports = User;