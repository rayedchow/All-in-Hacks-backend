const router = require('express').Router();
const User = require('../models/userModel');
const Token = require('../models/tokenDataModel');
const upload = (require('multer'))({ dest: 'tmp' });
const fs = require('fs');
const xlsx = require('xlsx');

router.post('/login', async (req, res) => {
	try {
		const { user, pass } = req.body;
		const userExists = await User.findOne({ user });

		if(userExists) {

			if(userExists.pass === pass) {
				const generatedToken = (Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)).substring(0, 20);

				const expireTime = new Date();
				expireTime.setTime(expireTime.getTime() + 2*3600000);
				const newTokenData = new Token({
					user,
					expire: expireTime.getTime()
				});
				await newTokenData.save();

				return res.json({ token: generatedToken });
			}

			return res.status(400).json({
				error: 'Incorrect password'
			});
		}

		else {
			const generatedToken = (Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)).substring(0, 20);
			const expireTime = new Date();
			expireTime.setTime(expireTime.getTime() + 2*3600000);
			const newTokenData = new Token({
				user,
				expire: expireTime.getTime()
			});
			await newTokenData.save();

			const newUserData = new User({
				user,
				pass,
				leads: []
			});
			await newUserData.save();

			return res.json({ token: generatedToken });
		}

	} catch(err) {
		console.error(err);
		res.status(500).send();
	}
});

router.post('/upload', upload.any(), async (req, res) => {
	try {
		const path = req.files[0].path;
		const workbook = xlsx.readFile(path);
		var sheet_name_list = workbook.SheetNames;
		const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
		console.log(jsonData);
		res.status(200).send('ok');
	} catch(err) {
		console.error(err);
		res.status(500).send();
	}
});

module.exports = router;