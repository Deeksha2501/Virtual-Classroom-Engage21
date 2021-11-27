const multer = require('multer');

const assignmentfileStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
	console.log('File Uploader');
	cb(null, true);
};

exports.multerUpload = multer({
	storage: assignmentfileStorage,
	fileFilter: fileFilter,
}).single("file");
