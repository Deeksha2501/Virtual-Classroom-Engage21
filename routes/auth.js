const express = require('express');
const router = express.Router();
const Inst = require('../models/Institute')
const {multerUpload} = require('../utils/multer')


//------------ Importing Controllers ------------//
const authController = require('../controllers/authController')

//------------ Login Route ------------//
router.get('/login', (req, res) => res.render('login'));

//------------ Forgot Password Route ------------//
router.get('/forgot', (req, res) => res.render('forgot'));

//------------ Reset Password Route ------------//
router.get('/reset/:id', (req, res) => {
    // console.log(id)
    res.render('reset', { id: req.params.id })
});

//------------ Register Route ------------//
router.get('/register',  async (req, res) => {
    var insts = await Inst.find();
    insts = insts.map(i => {return {_id: i._id, name: i.name}})
    console.log(insts)
    res.render('register' , {
        insts : insts
    }
)});

//------------ Register POST Handle ------------//
router.post('/register', multerUpload,  authController.registerHandle); 

//------------ Email ACTIVATE Handle ------------//
router.get('/activate/:token', authController.activateHandle);

//------------ Forgot Password Handle ------------//
router.post('/forgot', authController.forgotPassword);

//------------ Reset Password Handle ------------//
router.post('/reset/:id', authController.resetPassword);

//------------ Reset Password Handle ------------//
router.get('/forgot/:token', authController.gotoReset);

//------------ Login POST Handle ------------//
router.post('/login', authController.loginHandle);

//------------ Logout GET Handle ------------//
router.get('/logout', authController.logoutHandle);

module.exports = router;