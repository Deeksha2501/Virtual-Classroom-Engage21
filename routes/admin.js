const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/checkAuth')
const Class = require('../models/Class')
const Inst = require('../models/Institute')
const User = require('../models/User')
const {multerUpload} = require('../utils/multer')


const adminController = require('../controllers/admin');

router.get('/dashboard', adminController.getDashboard);
router.get('/inst-members', adminController.getMembers);
router.get('/class-create', adminController.GETcreateClass);
router.post('/class-create', multerUpload , adminController.POSTcreateClass);
router.get('/show-class/:classId', adminController.showClassById);
router.get('/invite/:classId', adminController.inviteStudentToClass);
router.get('/remove-student/:memberId', adminController.removeMember);
router.post('/show-class/:classId/disccusion/new/' , multerUpload , adminController.POSTDiscussion);
router.get('/show-class/:classId/classwork' , adminController.showClasswork)
router.get('/show-class/:classId/classwork/:assignmentId' , adminController.showAssignment)
router.get('/show-class/:classId/members' , adminController.showMembers)

module.exports = router;
