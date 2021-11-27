const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/checkAuth')
const Class = require('../models/Class')
const Inst = require('../models/Institute')
const User = require('../models/User')
const Homework = require('../models/HomeWork');
const Discussion = require('../models/Discussion');
var moment = require('moment');

const dateFormator = require('date-and-time')


const jwt = require('jsonwebtoken');
const JWT_KEY = "jwtactive987";
const JWT_RESET_KEY = "jwtreset987";
const Assignment = require('../models/Assignment');

const {multerUpload} = require('../utils/multer')

const {sendMail} = require('../utils/genUtils')

const {isFaculty, isStudent } = require('../utils/genUtils.js')

const {uploadFile} = require('../utils/fileUploader');

exports.getDashboard = async (req , res)=>{
    try {
        const cls = 
        await User
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
    
        res.render("Faculty/dash" , {
            user : req.user,
            classes_data : classes_data
        });
    } catch(err) {
        console.log(err)
        res.render('error_500');

    }
}

exports.GETcreateAssignment = async (req , res)=>{
    try {
        const u_id = req.user._id;
        const user = await User.findById(u_id);
        const { classId } = req.params;
        const clss = await Class.findById(classId);
        const cls = user.classes;
    
        const ind = cls.indexOf(classId);
        
    
        if(user.role == "student" || ind == -1)res.send("invalid");
        else res.render('Faculty/classes/create_assignment' , {
            clss
        });
    } catch(err) {
        console.log(err)
        res.render('error_500');

    }
}

exports.POSTcreateAssignment = async (req, res, next) => {
    try {
        const { classId } = req.params;
        const userClass = await Class.findById(classId).populate('students');

        const arrstudents = userClass.students;

        const {title, description } = req.body;
        const file = req.file;

        const assignment = Assignment({title: title, description: description , classId: classId});

        await assignment.save();

        file.filename = `Classes/${userClass.name}_${classId}/Assignments/${assignment.title}_${assignment._id}}/${file.originalname.split('.')[0]}_${Date.now()}.${file.mimetype.split('/')[1]}`;

        // console.log(file.filename);
        const fileUrl = await uploadFile(file);
        
        assignment.fileName = fileUrl;        
        console.log(assignment);
        await assignment.save();

        userClass.assignments.push(assignment);
        await userClass.save();


        const tempStudentsPromise = [];
        for(var i=0 ; i<arrstudents.length ; i++){
            arrstudents[i].assignments.push({_id: assignment});
            tempStudentsPromise.push(await arrstudents[i].save());
        }

        Promise.all(tempStudentsPromise);


        const url = "/faculty/show-class/" + classId + "/classwork";
        res.redirect(url);

    } catch(err) {
        console.log(err)
        res.render('error_500');

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

        res.render('Faculty/classes/show_class' , {
            userClass,
            arrDiscussionsDetails,
            arrDiscussions
        })
    }catch(err){
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
            console.log("already available")
            discussionDetails.discussion.push({
                sender_id : req.user._id,
                msg: discuss_msg,
                fileUrl : fileUrl
            })
        }else{
            console.log("new")
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

        const url = `/faculty/show-class/${classId}`;
        res.redirect(url);
        
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
    
        res.render('Faculty/classes/classwork' , {
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
        let userClass = await Class.findById(classId).populate('assignments').populate('faculty');

        let assignment = await Assignment.findById(assignmentId).populate({
            path: 'homework',
            populate: {
                path: 'studentId',
                model: 'User',
                select: '_id name',
            }
        });

        let faculty = userClass.faculty.name;

        let arrHomework = assignment.homework; 

        console.log(arrHomework);

        let user = await User.findById(userId);
        // let isSubmitted = user.assignments.find(assign => assign._id == assignmentId) ? 
        //                   user.assignments.find(assign => assign._id == assignmentId).submitted : undefined;
        
        // let isSubmitted = user.assignments[assignIndex].submitted;

        // console.log(isSubmitted);

        // res.send(arrHomework);
    
        res.render('Faculty/classes/show_assignment' , {
            userClass,
            assignment,
            // isSubmitted,
            arrHomework,
            faculty,
            moment: moment
        })
    } catch(err) {
        console.log(err)
        res.render('error_500');

    }
}

exports.updateMarks = async (req, res, next) => {
    try {
        const {classId, assignmentId, homeworkId, studentId} = req.params;
        const {marks} = req.body;

        const homework = await Homework.findById(homeworkId);

        console.log(homework);

        homework.marks = marks;

        await homework.save();

        await User.updateOne(
            { _id: studentId, "assignments._id": assignmentId },
            { $set: { "assignments.$.marks": marks} }
        ) 

        const url = "/faculty/show-class/" + classId + "/classwork/" + assignmentId;
        // /show-class/:classId/classwork/:assignmentId
        res.redirect(url);

    } catch(err) {
        console.log(err);
        res.render('error_500');

    }
}

exports.showMembers = async (req, res, next) => {

    const {classId} = req.params;
    const classDetails = await Class.findById(classId).populate('students').populate('faculty');

    const arrStudents = classDetails.students;

    
    const faculty = classDetails.faculty;
    
    console.log(arrStudents, faculty);

    res.render('Faculty/classes/class_members' , {
        arrStudents,
        faculty,
        userClassId : classDetails._id
    })

}


exports.reportStudent = async (req , res)=>{
    try {
        const faculty = req.user;
        const {studentId, classId} = req.params;
        let student = await User.findById(studentId);
        let instituteDetails = await Inst.findById(student.inst).populate('admin');
        let instituteAdmin = instituteDetails.admin;
        let classDetails = await Class.findById(classId);
        
        console.log(instituteDetails);

        // (req, res, receivers, subject, body , redirect_url , error_flash, success_flash) 
        const CLIENT_URL = 'http://' + req.headers.host;
        const url = `${CLIENT_URL}/profile/${studentId}`

        const body_admin = `
            Dear Admin, 
            It is requested to remove the ${student.name} studying in ${student.branch} of ${student.batch} from ${classDetails.name}.

            <a href="${url}">Student Profile</a>

            Thanks You!! 
        `;

        const body_student = `
            Dear ${student.name},

            You have been reported by ${faculty.name} in class ${classDetails.name}.
            
            You can contact the required faculity for further instructions, otherwise you will be expelled from the institute.

            Thanks You
        `

        const redirect_url = `/faculty/show-class/${classId}/members`;
        
        await sendMail(req, res, instituteAdmin.email, 'Report Student' , body_admin, redirect_url , 'Message Send', 'Message Fail to send')
        await sendMail(req, res, student.email, "You are Being Reported" , body_student, redirect_url , 'Message Send', 'Message Fail to send')

        // student.reported.push(classId) ;
        // await student.save();

        student.save()
        res.redirect(redirect_url);
        
    }catch(err){
        console.log(err);
        res.render('error_500');

    }




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
