const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/checkAuth')
const Class = require('../models/Class')
const Inst = require('../models/Institute')
const User = require('../models/User')
const Discussion = require('../models/Discussion')
const Assignment = require('../models/Assignment')
const jwt = require('jsonwebtoken');
const JWT_KEY = "jwtactive987";
const JWT_RESET_KEY = "jwtreset987";
var moment = require('moment');

const dateFormator = require('date-and-time')


const {sendMail} = require('../utils/genUtils')
const {uploadFile} = require('../utils/fileUploader');

const {isFaculty, isStudent } = require('../utils/genUtils.js')


exports.getDashboard = async (req , res)=>{

    try {

        const cls = 
        await Inst
        .findOne({_id : req.user.inst})
        .populate({
            path : 'classes',
            select: '_id name branch batch',
            populate : {
                path : 'faculty',
                select : 'name',
                model : 'User'
            }
        })

        // const classes = cls.reverse();
    
        const students = await User.find({inst : req.user.inst , role : "student"});
        const classes_data = cls.classes.reverse();
    
        res.render("admin/admin_dash" , {
            classes_data : classes_data,
            userId : req.user._id
        });
    } catch(err) {
        console.log(err)
        res.render('error_500');
    }


}

exports.getMembers = async (req , res)=>{
    try {

        const students = await User.find({inst : req.user.inst , role : "student"});
        const faculty = await User.find({inst : req.user.inst , role : "teacher"});
    
        res.render("admin/inst_members" , {
            students : students,
            faculty : faculty,
            userId : req.user._id
        });
    } catch (err) {
        console.log(err)
        res.render('error_500');

    }
}

exports.GETcreateClass = async (req , res)=>{

    try {

        const faculties = await User.find({role : "teacher" , inst : req.user.inst});
    
        res.render("admin/class_creation" , {
            faculties : faculties
        });
    } catch(err) {
        console.log(err);   
        res.render('error_500');

    }

}

exports.POSTcreateClass = async (req , res)=>{
    try{
        const user = await User.findById(req.user._id, 'id inst')
        const inst = await Inst.findById(user.inst)

        const {name , batch, branch, faculty}  = req.body;
        const file = req.file;

        let image_url = "https://www.gstatic.com/classroom/themes/img_cycling.jpg";

        if(file){
            file.filename = `Classes/themes/${file.originalname.split('.')[0]}_${Date.now()}.${file.mimetype.split('/')[1]}`;

            image_url = await uploadFile(file);
        }
        
        const cl = new Class({name:name, inst: user.inst, branch: branch, faculty: faculty, batch:batch, image_url});
        const classFacutly = await User.findById(faculty);

        await cl.save();

        inst.classes.push(cl._id);
        classFacutly.classes.push(cl._id);

        await classFacutly.save();
        await inst.save();
        
        res.redirect('/admin/dashboard');
        
    } catch(err) {
        console.error(err)
        res.send(err)
    }

}

exports.showClassById = async (req , res)=>{
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
    
        res.render("admin/show_class" , {
            userClass,
            arrDiscussionsDetails,
            arrDiscussions
        });
    } catch(err) {
        console.log(err)
        res.render('error_500');

    }

}

exports.inviteStudentToClass = async (req , res)=>{

    try {
        const {classId} = req.params;
        const cl = await Class.findById(classId).populate('faculty', '_id name');  //classname
        const inst = cl.inst; 
        const students = await User.find({inst : inst , batch : cl.batch , branch : cl.branch , role : "student"}); //arrstudents
        console.log(students);
        s_mails = students.map(s =>  s.email)
        if(s_mails.length == 0)res.send("no student");
        const CLIENT_URL = 'http://' + req.headers.host;
    
        
        const token = jwt.sign({ classId }, JWT_RESET_KEY, { expiresIn: '30m' });
        // const ur = `${CLIENT_URL}/student/join-class/${token}</p>`;

        const url = `${CLIENT_URL}/student/join-class/${token}`;
        console.log(url);
    
        const subject = "You are invited to join classroom - " + cl.name;
        const body = `
                Dear Student,
                
                <h3>${cl.faculty.name} has invited you to the class - "${cl.name}" </h3>
                <h4>Click on the below link to join the classroom</h4>
                <a href="${url}">Join Class</a>
                <p></p>
        `;
    
        const redirect_url = '/admin/show-class/' + classId;
        const error_flash = "Oops! Something went wrong! Try Again.";
        const success_flash = "Yay!! Invite Send Successfully ;)"
        sendMail(req, res, s_mails , subject , body , redirect_url , error_flash, success_flash)
    
        res.render('admin/invited_students' , {
            userClass : cl,
            students
        })

    } catch(err) {
        console.log(err)
        res.render('error_500');

    }
}


exports.removeMember = async (req , res) => {
    try {

        const {memberId} = req.params;

        const userClassesDetails = await User.findById(memberId);

        const arrClassIds = userClassesDetails.classes;

        const arrClassDetails = [];

        const arrDiscussionDetails = [];

        for(let i = 0; i < arrClassIds.length; i++) {
            console.log(arrClassIds[i]);

            arrClassDetails.push(await Class.findById(arrClassIds[i]));
        }

        const arrClassDetailsPromise = await Promise.all(arrClassDetails);

        // console.log({arrClassDetailsPromise, arrClassDetails, arrClassIds});


        // for(let i = 0; i < arrClassDetailsPromise.length; i++) {
        //     arrDiscussionDetails.push(await Discussion.find({classId: arrClassDetailsPromise[i]._id}));

        // }

        // const arrDiscussionDetailsPromise = await Promise.all(arrDiscussionDetails);

        // arrDiscussionDetailsPromise.map(de => de.discussion);

        // res.send(arrDiscussionDetailsPromise);

        

        const tempClassesPromise = [];
        for(let i = 0; i < arrClassDetailsPromise.length; i++) {
            const indexOfStudent = arrClassDetailsPromise[i].students.indexOf(memberId);

            if(indexOfStudent != -1) {
                arrClassDetailsPromise[i].students.splice(indexOfStudent, 1);
            }

            tempClassesPromise.push(await arrClassDetailsPromise[i].save());
        }

        await Promise.all(tempClassesPromise);

        // Class.updateOne({ _id: diveId }, { "$pull": { "students": { "_id": new ObjectId(memberId) } } }, { safe: true }, function(err, obj) {
        //     //do something smart
        // });

        await User.deleteOne( { "_id" : memberId});
        
        res.redirect("/admin/inst-members");
    } catch(err) {
        console.log(err)
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

        const url = `/admin/show-class/${classId}`;
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
    
        res.render('admin/classwork' , {
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

        let faculty = userClass.faculty.name;

        let assignment = await Assignment.findById(assignmentId).populate({
            path: 'homework',
            populate: {
                path: 'studentId',
                model: 'User',
                select: '_id name',
            }
        });

        let arrHomework = assignment.homework; 

        console.log(arrHomework);

        let user = await User.findById(userId);
        res.render('admin/show_assignment' , {
            userClass,
            assignment,
            arrHomework,
            faculty,
            moment: moment
        })
    } catch(err) {
        console.log(err)
        res.render('error_500');

    }
}

exports.showMembers = async (req, res, next) => {

    const {classId} = req.params;
    const classDetails = await Class.findById(classId).populate('students').populate('faculty');

    const arrStudents = classDetails.students;
    const faculty = classDetails.faculty;
    
    // console.log(arrStudents, faculty);

    res.render('admin/class_members' , {
        arrStudents,
        faculty,
        userClassId : classDetails._id
    })

}

//controller