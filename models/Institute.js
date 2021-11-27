const mongoose = require('mongoose');

//------------ INSTITUTE Schema ------------//
const InstSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  admin: {
    type : mongoose.Schema.Types.ObjectId,
    ref : "User"
  },
  inst:{
    type: String,
    required : true
  },
  
  members : {
    students : [{
      type : mongoose.Schema.Types.ObjectId,
      ref : "User"
    }],
    faculty : [{
      type : mongoose.Schema.Types.ObjectId,
      ref : "User"
    }]
  },

  classes : [{
    type : mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }]

}, { timestamps: true });

const Inst = mongoose.model('Inst', InstSchema);

module.exports = Inst;