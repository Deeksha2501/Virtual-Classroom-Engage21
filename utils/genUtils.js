const nodemailer = require('nodemailer');
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
require('dotenv').config();



exports.sendMail = (req, res, receivers, subject, body , redirect_url , error_flash, success_flash) => {
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
	// const token = jwt.sign({ name, email, password , inst , role , batch , branch}, JWT_KEY);
	const accessToken = process.env.accessToken;
	    

	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			type: "OAuth2",
			user: "sharmadeeksha325@gmail.com",
			clientId: "1060734479107-d1b9ssit27lpueeupmebq7163hequi6b.apps.googleusercontent.com",
			clientSecret: "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",
			refreshToken: "1//04hcR5W4I9E4hCgYIARAAGAQSNwF-L9Ir-tTKyYtxwFiqk9diKtxG6cEyH-OtkBpzSO5zXXTYj0Qi946HFRh1OaFPQMD49-1YQgs",
			accessToken: accessToken
		},
	});

	// send mail with defined transport object
	const mailOptions = {
		from: '"Deeksha Sharma" <sharmadeeksha325@gmail.com>', // sender address
		to: receivers, // list of receivers
		subject: subject, // Subject line
		generateTextFromHTML: true,
		html: body, // html body
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.log({redirect_url});
			console.log(error);
			req.flash(
				'error_msg',
				error_flash
			);
			res.redirect(redirect_url);
		}
		else {
			console.log('Mail sent : %s', info.response);
			req.flash(
				'success_msg',
				success_flash
			);
			res.redirect(redirect_url);
		}
	})
}

exports.isFaculty = (req, res, next) => {

	req.user.role === 'teacher' ? next() : res.send('Are u trying to hack us? You little nerd!! 🤓')

	// if(req.user.role == 'teacher')
	// 	next();
	
	// else
	// res.send('Are u trying to hack us? You little nerd!! 🤓')
}

exports.isStudent = (req, res, next) => {
	if(req.user.role == 'student')
		next();
	
	else
		res.send('This is not a staff room!! 😒')
}

exports.isAdmin = (req, res, next) => {
	if(req.user.admin)
		next();
	
	else
		res.send('You are not mighty GOD!! 🧚')
}