const mongoose = require('mongoose');

//------------ Discussion Schema ------------//
const DiscussSchema = new mongoose.Schema({

  classId : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Class"
  },

  discussion: [{
      sender_id : {
         type : mongoose.Schema.Types.ObjectId,
         ref : "User"
      },
      msg: String,
      fileUrl : String,
      date: {
         type:Date,
         default:Date.now
      }
   }],

}, { timestamps: true });   

const Discuss = mongoose.model('Discuss', DiscussSchema);

module.exports = Discuss;