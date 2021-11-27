const jwt = require('jsonwebtoken');
const { storage } = require('./gcloudauth.js');

const bucket = storage.bucket(process.env.GCLOUD_BUCKET_NAME);

exports.uploadFile = async file => {
	return new Promise((resolve, reject) => {
		console.log('File Upload Started');
		const blob = bucket.file(file.filename);
		const blobStream = blob.createWriteStream({
			resumable: false,
		});

		blobStream.on('error', err => {
			reject(err);
		});

		blobStream.on('finish', async () => {
			// create a url to access file
			const publicURL = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
			console.log('File Uplaod Finish');
			resolve(publicURL);
		});

		blobStream.end(file.buffer);
	});
};