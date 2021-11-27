const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/checkAuth')
const Class = require('../models/Class')
const Inst = require('../models/Institute')
const User = require('../models/User')
const jwt = require('jsonwebtoken');
const JWT_KEY = "jwtactive987";
const JWT_RESET_KEY = "jwtreset987";

const {sendMail} = require('../utils/genUtils')

const {isFaculty, isStudent } = require('../utils/genUtils.js')


router.use('/faculty',ensureAuthenticated, isFaculty ,require('./faculty'));
router.use('/admin', ensureAuthenticated, require('./admin'));
router.use('/student',ensureAuthenticated, isStudent, require('./student'));



//------------ Welcome Route ------------//
router.get('/', (req, res) => {
    res.render('welcome');
});

//------------ Dashboard Route ------------//
router.get('/dashboard', ensureAuthenticated,  async (req, res) => {
    const inst_id = req.user.inst;
    const inst = await Inst.findById(inst_id);
    console.log(inst)

    res.render('home' , {
        inst : inst,
        name: req.user.name,
        admin : req.user.admin,
        role : req.user.role,
        id : req.user._id
    });

});

// router.get("/admin/class-create" , ensureAuthenticated , async (req , res)=>{

//     const faculties = await User.find({role : "teacher" , inst : req.user.inst});

//     res.render("admin/class_creation" , {
//         faculties : faculties
//     });
// });


// router.post("/admin/class-create", ensureAuthenticated , async (req , res)=>{
//     try{
//         console.log(req.user)
//         const user = await User.findById(req.user._id, 'id inst')
//         const inst = await Inst.findById(user.inst)

//         const {name , batch, branch, faculty}  = req.body;
        
//         const cl = new Class({name:name, inst: user.inst, branch: branch, faculty: faculty, batch:batch});
//         const fctly = await User.findById(faculty);
//         console.log({name , branch, faculty, batch});
//         console.log("**********************");
//         console.log(cl);
//         await cl.save();

//         console.log(inst)
//         inst.classes.push(cl._id);
//         fctly.classes.push(cl._id);

//         await fctly.save();
//         await inst.save();
        
//         res.redirect('/admin');
        
//     } catch(err) {
//         console.error(err)
//         res.send(err)
//     }

// });


// router.get("/admin/show-class/:classId" , ensureAuthenticated , async (req , res)=>{
//     const {classId} = req.params;

//     const cl = await Class.findById(classId);

//     res.render("admin/show_class" , {
//         cl
//     });

// });

// router.get("/admin/invite/:classId" , ensureAuthenticated , async (req , res)=>{
//     const {classId} = req.params;
//     const cl = await Class.findById(classId);
//     const inst = cl.inst;
//     const batch = cl.batch;
//     const branch = cl.branch;
//     const students = await User.find({inst : inst , batch : batch , branch : branch , role : "student"});
//     console.log(students);
//     s_mails = students.map(s =>  s.email)
//     if(s_mails.length == 0)res.send("no student");
//     const CLIENT_URL = 'http://' + req.headers.host;

    
//     const token = jwt.sign({ classId }, JWT_RESET_KEY, { expiresIn: '30m' });
//     const ur = `${CLIENT_URL}/join-class/${token}</p>`;
//     console.log(ur);

//     const subject = "You are invited to join classroom - " + cl.name;
//     const body = `
//     <h2>Click on the below link to join the classroom</h2>
//     <p>${CLIENT_URL}/join-class/${token}</p>
//     `;
//     const redirect_url = '/admin/show-class/' + classId;
//     const error_flash = "Oops! Something went wrong! Try Again.";
//     const success_flash = "Yay!! Invite Send Successfully ;)"
//     sendMail(req, res, s_mails , subject , body , redirect_url , error_flash, success_flash)

    
//     res.send("invited");
// });




router.get('/profile/:id' , ensureAuthenticated , async (req , res)=>{
    const {id} = req.params;
    const u_id = req.user._id;
    const session_user = await User.findById(u_id);
    var ownP = false;
    if(u_id == id){
        ownP = true;
    }
    const user = await User.findById(id).populate('inst', '_id name') ;
    res.render('profile' , {
        user, 
        ownP,
        session_user
    })
});


module.exports = router;



// router.get('/teacher/create-assign/:classId' , ensureAuthenticated , async (req , res)=>{
//     const u_id = req.user._id;
//     const user = await User.findById(u_id);
//     const { classId } = req.params;
//     const cls = user.classes;

//     const ind = cls.indexOf(classId);
    

//     if(user.role == "student" || ind == -1)res.send("invalid");
//     else res.send("kar rha hai kaam");
// });






// deadline
// max-marks
// passing parks
// report
// notification over an email(deadline is close)
// 


// student
// rate a class
/* feedback 
discussion tab under assignment - (*)
email validationa nd validation ✅
background image
theme change
 profile page for student and teacher✅


*/

// admin 
// teacher
// student



 // const cls = await User
    // .findOne({_id : req.user._id})
    // .populate({
    //     path : 'classes',
    //     select: '_id name',
    //     populate : {
    //         path : 'faculty',
    //         select : 'name',
    //         model : 'User'
    //     }
    // })

    // const classes_data = cls.classes;

    

    // res.render('dash', {
    //     name: req.user.name,
    //     admin : req.user.admin,
    //     classes_data
    // })



    // router.get("/admin" , async (req , res)=>{

//     let pop_class;

//     const cls = 
//     await Inst
//     .findOne({_id : req.user.inst})
//     .populate({
//         path : 'classes',
//         select: '_id name',
//         populate : {
//             path : 'faculty',
//             select : 'name',
//             model : 'User'
//         }
//     })



//     const classes_data = cls.classes;
//     console.log(classes_data);

//     res.render("admin/admin_dash" , {
//         classes_data : classes_data
//     });
// });