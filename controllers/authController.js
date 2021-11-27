const passport = require('passport');
const bcryptjs = require('bcryptjs');
const nodemailer = require('nodemailer');
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const jwt = require('jsonwebtoken');
const JWT_KEY = "jwtactive987";
const JWT_RESET_KEY = "jwtreset987";
const Inst = require('../models/Institute')
require('dotenv').config();

const {sendMail} = require('../utils/genUtils')
const {uploadFile} = require('../utils/fileUploader');

//------------ User Model ------------//
const User = require('../models/User');

//------------ Register Handle ------------//
exports.registerHandle = async (req, res) => {
    try {

        const { name, email, password, password2 , inst , role, branch, batch } = req.body;
        console.log({ name, email, password, password2 , inst , role, branch, batch })
        let errors = [];

        let file = req.file;

        let fileUrl = "";

        if(file){
            file.filename = `Users/${email}/${file.originalname.split('.')[0]}_${Date.now()}.${file.mimetype.split('/')[1]}`;
            
            fileUrl = await uploadFile(file);
        }
        
        
    
        //------------ Checking required fields ------------//
        if (!name || !email || !password || !password2 || (role == 'student' && (!branch || !batch))) {
            errors.push({ msg: 'Please enter all fields' });
        }
    
        //------------ Checking password mismatch ------------//
        if (password != password2) {
            errors.push({ msg: 'Passwords do not match' });
        }
    
        //------------ Checking password length ------------//
        if (password.length < 8) {
            errors.push({ msg: 'Password must be at least 8 characters' });
        }
    
        var insts = await Inst.find();
        insts = insts.map(i => {return {_id: i._id, name: i.name}})
    
        if (errors.length > 0) {
            res.render('register', {
                errors,
                name,
                email,
                password,
                password2,
                inst,
                insts : insts
            });
        } else {
            //------------ Validation passed ------------//
            User.findOne({ email: email }).then(user => {
                if (user) {
                    //------------ User already exists ------------//
    
    
                    errors.push({ msg: 'Email ID already registered' });
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2,
                        inst,
                        insts : insts
                    });
                } else {
    
                    // const oauth2Client = new OAuth2(
                    //     "1060734479107-d1b9ssit27lpueeupmebq7163hequi6b.apps.googleusercontent.com",
                    //     "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", // Client Secret
                    //     "https://developers.google.com/oauthplayground" // Redirect URL
                    // );
    
                    // oauth2Client.setCredentials({
                    //     refresh_token: "1//04hcR5W4I9E4hCgYIARAAGAQSNwF-L9Ir-tTKyYtxwFiqk9diKtxG6cEyH-OtkBpzSO5zXXTYj0Qi946HFRh1OaFPQMD49-1YQgs"
                    // });
                    // const accessToken = oauth2Client.getAccessToken()
    
                    // const token = jwt.sign({ name, email, password , inst , role , batch , branch}, JWT_KEY, { expiresIn: '30m' });
                    // const CLIENT_URL = 'http://' + req.headers.host;
    
                    // const ur = `${CLIENT_URL}/auth/activate/${token}`;
                    
    
                    // const output = `
                    // <h3>Please click on below link to activate your account</h3>
                    // <p>${CLIENT_URL}/auth/activate/${token}</p>
                    // <p><b>NOTE: </b> The above activation link expires in 30 minutes.</p>
                    // `;
    
                    // const transporter = nodemailer.createTransport({
                    //     service: 'gmail',
                    //     auth: {
                    //         type: "OAuth2",
                    //         user: "sharmadeeksha325@gmail.com",
                    //         clientId: "1060734479107-d1b9ssit27lpueeupmebq7163hequi6b.apps.googleusercontent.com",
                    //         clientSecret: "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",
                    //         refreshToken: "1//04hcR5W4I9E4hCgYIARAAGAQSNwF-L9Ir-tTKyYtxwFiqk9diKtxG6cEyH-OtkBpzSO5zXXTYj0Qi946HFRh1OaFPQMD49-1YQgs",
                    //         accessToken: accessToken
                    //     },
                    // });
    
                    // // send mail with defined transport object
                    // const mailOptions = {
                    //     from: '"Deeksha Sharma" <sharmadeeksha325@gmail.com>', // sender address
                    //     to: email, // list of receivers
                    //     subject: "Account Verification: Virtual Classroom 👨‍🎓 ", // Subject line
                    //     generateTextFromHTML: true,
                    //     html: output, // html body
                    // };
    
                    // transporter.sendMail(mailOptions, (error, info) => {
                    //     if (error) {
                    //         console.log(error);
                    //         req.flash(
                    //             'error_msg',
                    //             'Something went wrong on our end. Please register again.'
                    //         );
                    //         res.redirect('/auth/login');
                    //     }
                    //     else {
                    //         console.log('Mail sent : %s', info.response);
                    //         req.flash(
                    //             'success_msg',
                    //             'Activation link sent to email ID. Please activate to log in.'
                    //         );
                    //         res.redirect('/auth/login');
                    //     }
                    // })
    
                    const token = jwt.sign({ name, email, password , inst , role , batch , branch , fileUrl}, JWT_KEY, { expiresIn: '30m' });
                    const CLIENT_URL = 'http://' + req.headers.host;
                    const ur = `${CLIENT_URL}/auth/activate/${token}`;
                    console.log(ur);
                    const body = `
                    Dear User, 
                    Thanks You for signing up at Virtual Classroom.

                    <h4>To activate your account, you must click on the link below:</h4>
                    <p>
                        <a href="${ur}">Activate Account</a>
                    </p>
                    <p><b>NOTE: </b> The above activation link expires in ⏱ 30 minutes. ⏱ </p>

                    <p> Have fun, and don't hesitate to contact us with your feedback. </p>
                    `;
    
                    const subject = "Account Verification: Virtual Classroom 👨‍🎓 ";
                    const error_flash = "Something went wrong on our end. Please register again.";
                    const success_flash = "Activation link sent to email ID. Please activate to log in.";
                    const redirect_url = '/auth/login';
                    // receivers, subject, body , redirect_url , error_flash, success_flash
                    sendMail(req, res, email , subject , body , redirect_url , error_flash, success_flash)
                }
            });
        }
    } catch(err) {
        console.log(err)
        res.render('error_500');

    }
}

//------------ Activate Account Handle ------------//
exports.activateHandle = async (req, res) => {
    try {

        const token = req.params.token;
        let errors = [];
        if (token) {
            jwt.verify(token, JWT_KEY, (err, decodedToken) => {
                if (err) {
                    req.flash(
                        'error_msg',
                        'Incorrect or expired link! Please register again.'
                    );
                    res.redirect('/auth/register');
                }
                else {
                    const { name, email, password , inst , role , batch , branch , fileUrl} = decodedToken;
                    console.log({ name, email, password , inst , role});
                    User.findOne({ email: email }).then(user => {
                        if (user) {
                            //------------ User already exists ------------//
                            req.flash(
                                'error_msg',
                                'Email ID already registered! Please log in.'
                            );
                            res.redirect('/auth/login');
                        } else {
    
                            const newUser = new User({
                                name,
                                email,
                                password,
                                inst,
                                role,
                                profileImage : fileUrl
                            });
    
                            if(role == "student"){
                                console.log('running' , {batch , branch});
                                newUser.batch = batch;
                                newUser.branch = branch;
                            }
    
    
    
                            bcryptjs.genSalt(10, (err, salt) => {
                                bcryptjs.hash(newUser.password, salt, (err, hash) => {
                                    if (err) throw err;
                                    newUser.password = hash;
                                    newUser
                                        .save()
                                        .then(user => {
                                            console.log(user);
    
                                            // const ins = await Inst.findById(inst);
                                            // if(role == "student"){
                                            //     ins.students.push(user);
                                            // }else{
                                            //     ins.faculty.push(user);
                                            // }
    
                                            // await ins.save();
    
                                            req.flash(
                                                'success_msg',
                                                'Account activated. You can now log in.'
                                            );
                                            res.redirect('/auth/login');
                                        })
                                        .catch(err => console.log(err));
                                });
                            });
                        }
                    });
                }
    
            })
        }
        else {
            console.log("Account activation error!")
        }
    }
    catch (err) {
        console.log(err)
        res.render('error_500');

    }
}

//------------ Forgot Password Handle ------------//
exports.forgotPassword = (req, res) => {
    try {

        const { email } = req.body;
    
        let errors = [];
    
        //------------ Checking required fields ------------//
        if (!email) {
            errors.push({ msg: 'Please enter an email ID' });
        }
    
        if (errors.length > 0) {
            res.render('forgot', {
                errors,
                email
            });
        } else {
            User.findOne({ email: email }).then(user => {
                if (!user) {
                    //------------ User already exists ------------//
                    errors.push({ msg: 'User with Email ID does not exist!' });
                    res.render('forgot', {
                        errors,
                        email
                    });
                } else {
    
                    const oauth2Client = new OAuth2(
                        "1060734479107-d1b9ssit27lpueeupmebq7163hequi6b.apps.googleusercontent.com",
                        "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", // Client Secret
                        "https://developers.google.com/oauthplayground" // Redirect URL
                    );
    
                    oauth2Client.setCredentials({
                        refresh_token: "1//0474S6KpsGMWYCgYIARAAGAQSNwF-L9Iroe09HJZOmtVgnliHUqyqYZmJpdlBnaQzQzdFXOAeQUtPbwNH31ojW2Gkq-vc1_K1XMM"
                    });
                    // const accessToken = "ya29.a0ARrdaM-kRfO3R_cMgmthHEr_6X9O5ULWvRX_AKnuNCSGMikxzsa4zPCat49c8spqp42v0xacbAYdIO2lmONXDUDxCE8YRDro-qKGY-xo26XnuiQ9O-uNWwql6rVonH8ThqutNGMdBdR4_ZZJTu3rCBz1usyF"
                    // const accessToken = oauth2Client.getAccessToken()
                    const accessToken = process.env.accessToken;
                    
                    const token = jwt.sign({ _id: user._id }, JWT_RESET_KEY, { expiresIn: '30m' });
    
                    const CLIENT_URL = 'http://' + req.headers.host;
    
                    
                    const output = `
                    <h2>Please click on below link to reset your account password</h2>
                    <p>${CLIENT_URL}/auth/forgot/${token}</p>
                    <p><b>NOTE: </b> The activation link expires in 30 minutes.</p>
                    `;
    
                    User.updateOne({ resetLink: token }, (err, success) => {
                        if (err) {
                            errors.push({ msg: 'Error resetting password!' });
                            res.render('forgot', {
                                errors,
                                email
                            });
                        }
                        else {
                            const transporter = nodemailer.createTransport({
                                service: 'gmail',
                                auth: {
                                    type: "OAuth2",
                                    user: "sharmadeeksha325@gmail.com",
                                    clientId: "1060734479107-d1b9ssit27lpueeupmebq7163hequi6b.apps.googleusercontent.com",
                                    clientSecret: "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",
                                    refreshToken: "1//0474S6KpsGMWYCgYIARAAGAQSNwF-L9Iroe09HJZOmtVgnliHUqyqYZmJpdlBnaQzQzdFXOAeQUtPbwNH31ojW2Gkq-vc1_K1XMM",
                                    accessToken: accessToken
                                },
                            });
    
                            // send mail with defined transport object
                            const mailOptions = {
                                from: '"Deeksha Sharma" <sharmadeeksha325@gmail.com>', // sender address
                                to: email, // list of receivers
                                subject: "Account Password Reset: Virtual Classroom 👨‍🎓", // Subject line
                                html: output, // html body
                            };
    
                            transporter.sendMail(mailOptions, (error, info) => {
                                if (error) {
                                    console.log(error);
                                    req.flash(
                                        'error_msg',
                                        'Something went wrong on our end. Please try again later.'
                                    );
                                    res.redirect('/auth/forgot');
                                }
                                else {
                                    console.log('Mail sent : %s', info.response);
                                    req.flash(
                                        'success_msg',
                                        'Password reset link sent to email ID. Please follow the instructions.'
                                    );
                                    res.redirect('/auth/login');
                                }
                            })
                        }
                    })
    
                }
            });
        }
    } catch(err) {
        console.log(err)
        res.render('error_500');

    }
}

//------------ Redirect to Reset Handle ------------//
exports.gotoReset = (req, res) => {
    try {

        const { token } = req.params;
    
        if (token) {
            jwt.verify(token, JWT_RESET_KEY, (err, decodedToken) => {
                if (err) {
                    req.flash(
                        'error_msg',
                        'Incorrect or expired link! Please try again.'
                    );
                    res.redirect('/auth/login');
                }
                else {
                    const { _id } = decodedToken;
                    User.findById(_id, (err, user) => {
                        if (err) {
                            req.flash(
                                'error_msg',
                                'User with email ID does not exist! Please try again.'
                            );
                            res.redirect('/auth/login');
                        }
                        else {
                            res.redirect(`/auth/reset/${_id}`)
                        }
                    })
                }
            })
        }
        else {
            console.log("Password reset error!")
        }
    } catch(err) {
        console.log(err)
        res.render('error_500');

    }
}


exports.resetPassword = (req, res) => {
    try {

        var { password, password2 } = req.body;
        const id = req.params.id;
        let errors = [];
    
        //------------ Checking required fields ------------//
        if (!password || !password2) {
            req.flash(
                'error_msg',
                'Please enter all fields.'
            );
            res.redirect(`/auth/reset/${id}`);
        }
    
        //------------ Checking password length ------------//
        else if (password.length < 8) {
            req.flash(
                'error_msg',
                'Password must be at least 8 characters.'
            );
            res.redirect(`/auth/reset/${id}`);
        }
    
        //------------ Checking password mismatch ------------//
        else if (password != password2) {
            req.flash(
                'error_msg',
                'Passwords do not match.'
            );
            res.redirect(`/auth/reset/${id}`);
        }
    
        else {
            bcryptjs.genSalt(10, (err, salt) => {
                bcryptjs.hash(password, salt, (err, hash) => {
                    if (err) throw err;
                    password = hash;
    
                    User.findByIdAndUpdate(
                        { _id: id },
                        { password },
                        function (err, result) {
                            if (err) {
                                req.flash(
                                    'error_msg',
                                    'Error resetting password!'
                                );
                                res.redirect(`/auth/reset/${id}`);
                            } else {
                                req.flash(
                                    'success_msg',
                                    'Password reset successfully!'
                                );
                                res.redirect('/auth/login');
                            }
                        }
                    );
    
                });
            });
        }
    } catch(err) {
        console.log(err)
        res.render('error_500');

    }
}

//------------ Login Handle ------------//
exports.loginHandle = (req, res, next) => {
    try{

        passport.authenticate('local', {
            successRedirect: '/dashboard',
            failureRedirect: '/auth/login',
            failureFlash: true
        })(req, res, next);
    } catch(err) {
        console.log(err)
        res.render('error_500');

    }
}

//------------ Logout Handle ------------//
exports.logoutHandle = (req, res) => {
    try{
        req.logout();
        req.flash('success_msg', 'You are logged out');
        res.redirect('/auth/login');
    }catch(err){
        console.log(err);
        res.render('error_500');

    }
}

