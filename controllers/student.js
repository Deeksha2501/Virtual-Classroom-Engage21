const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/checkAuth')
const Class = require('../models/Class')
const Inst = require('../models/Institute')
const User = require('../models/User')
const Assignment = require('../models/Assignment')
const Homework = require('../models/HomeWork')
const Discussion = require('../models/Discussion')
const jwt = require('jsonwebtoken');
const JWT_KEY = "jwtactive987";
const JWT_RESET_KEY = "jwtreset987";
var moment = require('moment');

const dateFormator = require('date-and-time')



const {uploadFile} = require('../utils/fileUploader');
const { language_v1beta1 } = require('googleapis');
const {sendMail} = require('../utils/genUtils');


exports.getDashboard = async (req , res)=>{

    const cls = await User
    .findOne({_id : req.user._id})
    .populate({
        path : 'classes',
        select: '_id name',
        populate : {
            path : 'faculty',
            select : 'name',
            model : 'User'
        }
    })


    const classes_data = cls.classes;
    console.log(classes_data);

    res.render("student/dash" , {
        user : req.user,
        classes_data : classes_data
    });
}


exports.joinClass = async (req , res)=>{
    const token = req.params.token;
    console.log({token})
    let errors = [];
    if (token) {
        jwt.verify(token, JWT_RESET_KEY, async (err, decodedToken) => {
            console.log(err);
            if (err) {
                req.flash(
                    'error_msg',
                    'Incorrect or expired link! Please register again.'
                );
                res.redirect('/dashboard');
                // res.send('error');
            }else{
                //join class
                const userId = req.user._id;
                const { classId } = decodedToken;
                const classes = await Class.findById(classId);

                const student = await User.findById(userId);

                //check if student is already present
                // if(classes.students.find(userId) != -1) res.redirect('/dashboard');

                student.classes.push(classId);
                await student.save();
                classes.students.push(userId);
                await classes.save();
                
                const token = jwt.sign({ classId }, JWT_RESET_KEY, { expiresIn: '30m' });
                const CLIENT_URL = 'http://' + req.headers.host;
                const url = `${CLIENT_URL}/student/show-class/${classId}`;
                const subject = "You Joined the Class Sucessfully " + classes.name;
                const body = `
                        Dear ${student.name},
                        
                        <h3>You have sucessfully joined the ${classes.name}" </h3>
                        <h4>Click on the below link to go to the classroom</h4>
                        <a href="${url}">Go to the class</a>
                        <p></p>
                `;
            
                const redirect_url = '/admin/show-class/' + classId;
                const error_flash = "Oops! Something went wrong! Try Again.";
                const success_flash = "Yay!! Invite Send Successfully ;)"
                sendMail(req, res, student.email , subject , body , redirect_url , error_flash, success_flash)
                res.redirect(url);
                // res.send("success");

            }
        });
    }
}

exports.showClass = async (req , res)=>{
    try {
        const {classId} = req.params;
        const userClass = await  Class.findById(classId).populate('faculty', '_id name');
        const arrDiscussionsDetails = await Discussion.findOne({classId : classId}).populate('discussion.sender_id');

        let arrDiscussions = [];

        console.log({arrDiscussionsDetails});

        if(arrDiscussionsDetails != undefined ){
            arrDiscussions = arrDiscussionsDetails.discussion.reverse();
        }

        console.log(arrDiscussions, arrDiscussionsDetails);

        res.render('Student/classes/show_class' , {
            userClass,
            arrDiscussionsDetails,
            arrDiscussions
        })
    }catch(err){
        console.log(err);
        res.render('error_500');

    }
        
}


exports.showClasswork = async (req , res)=>{
    try {
        const {classId} = req.params;
        const userClass = await Class.findById(classId).populate('assignments');

        const arrAssignments = userClass.assignments.reverse();
        
        arrAssignments.map(assignment => assignment.assignDate = dateFormator.format(new Date(assignment.updatedAt), 'DD/MM/YYYY'));
        
        console.log(arrAssignments);

        res.render('Student/classes/classwork' , {
            userClass,
            arrAssignments,
            moment: moment
        })
    } catch(err) {
        console.log(err)
        res.render('error_500');

    }
}

exports.showAssignment = async (req , res)=>{
    try {
        let userId = req.user._id;
        let {classId, assignmentId} = req.params;
        let userClass = await Class.findById(classId).populate('assignments');
        let assignment = await Assignment.findById(assignmentId).populate('homework');
        console.log("****************" , assignment.homework);

        const studentMarks = assignment.homework.find(ww => ww.studentId.toString() == userId.toString())

        console.log({studentMarks});

        let user = await User.findById(userId);
        let isSubmitted = user.assignments.find(assign => assign._id == assignmentId) ? 
                          user.assignments.find(assign => assign._id == assignmentId).submitted : undefined;

        
        
        // let isSubmitted = user.assignments[assignIndex].submitted;

        console.log(isSubmitted);
    
        res.render('Student/classes/show_assignment' , {
            userClass,
            assignment,
            isSubmitted,
            moment: moment,
            studentMarks
        })
    } catch(err) {
        console.log(err)
        res.render('error_500');

    }
}

exports.submitAssignment = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        const {classId, assignmentId} = req.params;
        const file = req.file;
        const userClass = await Class.findById(classId);
        const assignment = await Assignment.findById(assignmentId);
            
        file.filename = `Classes/${userClass.name}_${classId}/Assignments/${assignment.title}_${assignmentId}}/Submissions/${file.originalname.split('.')[0]}_${Date.now()}.${file.mimetype.split('/')[1]}`;
        
        // console.log(file.filename);
        const fileUrl = await uploadFile(file);
        const homework = new Homework({studentId: req.user._id, assignment_id: assignmentId, homeWorkFile: fileUrl})  

        await homework.save();

        assignment.homework.push(homework);
        await assignment.save();

        // await user.updateOne(
        //     { _id : userId ,  "assignments.id": assignmentId },
        //     {
        //         $set: {
        //             "assignments.$.submitted": true
        //          }
        //     }
        // )


        // user.findOneAndUpdate({_id : userId ,  "assignments._id": assignmentId}, 
        // {'$set': {
        //     'assignments.$.submitted': true
        // }}, function(err) { 
        //     console.log(err);
            
        // })

        await User.updateOne(
            { _id: userId, "assignments._id": assignmentId },
            { $set: { "assignments.$.submitted": true} }
        )

        const data = await User.findById(userId);

        console.log(data);
        
        const url = `/student/show-class/${classId}/classwork/${assignmentId}`
        res.redirect(url);

    } catch(err) {
        console.log(err);
        res.render('error_500');

    }
}


exports.POSTDiscussion = async (req , res)=>{
    try{
        const {classId } = req.params;
        const userClass = await  Class.findById(classId);
        const {discuss_msg} = req.body;

        const file = req.file;

        let fileUrl = "";

        if(file){
            file.filename = `Classes/${userClass.name}_${classId}/Discussions/${file.originalname.split('.')[0]}_${Date.now()}.${file.mimetype.split('/')[1]}`;

            fileUrl = await uploadFile(file);
        }

        let discussionDetails = await Discussion.findOne({classId : classId});

    
        if(discussionDetails != null){
            // console.log("already available")
            discussionDetails.discussion.push({
                sender_id : req.user._id,
                msg: discuss_msg,
                fileUrl : fileUrl
            })
        }else{
            // console.log("new")
            discussionDetails = new Discussion({
                classId : classId,
                discussion : {
                    sender_id : req.user._id,
                    msg: discuss_msg,
                    fileUrl : fileUrl
                }
            })
        }

        await discussionDetails.save();

        const url = `/student/show-class/${classId}`;
        res.redirect(url);
        
    }catch(err){
        console.log(err);
        res.render('error_500');

    }
}


exports.showMembers = async (req, res, next) => {

    const {classId} = req.params;
    const classDetails = await Class.findById(classId).populate('students').populate('faculty');

    const arrStudents = classDetails.students;
    const faculty = classDetails.faculty;
    
    // console.log(arrStudents, faculty);

    res.render('Student/classes/class_members' , {
        arrStudents,
        faculty,
        userClassId : classDetails._id
    })

}

exports.showInstMembers = async (req , res)=>{
    try {

        const students = await User.find({inst : req.user.inst , role : "student"});
        const faculty = await User.find({inst : req.user.inst , role : "teacher"});
    
        res.render("Faculty/inst_members" , {
            students : students,
            faculty : faculty,
            userClassId : req.user._id
        });
    } catch (err) {
        console.log(err)
        res.render('error_500');

    }
}