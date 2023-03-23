const router = require('express').Router();
const Company = require('../models/Company');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const Auth = require('../models/Auth');
const Job = require('../models/Job');
const Apply = require('../models/Apply');
const excel = require('excel4node');
const path = require('path');
const fs = require('fs/promises')
const crypto = require('crypto');
const multer = require('multer');
const pcloud = require('../pcloud');
const uuid = require('uuid');
const validateCompany = require('../middlewares/validate-company');

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, 'temp/upload/');
    },
    filename: function (req, file, callback) {
      callback(null, uuid.v4().concat('.').concat(file.mimetype.split('/')[1]));
    }
  }),
  fileFilter: function (req, file, callback) {
    if (file.mimetype === 'application/pdf') {
      callback(null, true);
    } else {
      callback(null, false);
    }
  }
});

router.post('/', upload.single('supportingDocument'), async (req, res) => {
  if (!req.file) return res.sendStatus(400);
  try {
    const email = await Company.findOne({ email: req.body.email });
    const phone = await Company.findOne({ phone: req.body.phone });
    if (email !== null || phone !== null) {
      res.status(409).json({
        email: email !== null,
        phone: phone !== null
      });
    } else {
      const fileId = (await pcloud.upload(`temp/upload/${req.file.filename}`, 3718932348)).metadata.fileid;
      await Company.create({
        name: req.body.name,
        contactPersonName: req.body.contactPersonName,
        industry: req.body.industry,
        email: req.body.email,
        phone: req.body.phone,
        website: req.body.website,
        address: req.body.address,
        password: req.body.password,
        supportingDocumentFileId: fileId
      });
      const transport = nodemailer.createTransport({
        'host': 'smtp-mail.outlook.com',
        'port': 587,
        'secure': false,
        'auth': {
          'user': process.env.EMAIL_USER,
          'pass': process.env.EMAIL_PASSWORD
        }
      });
      const message = {
        'from': `"KGEC Training and Placement Cell" ${process.env.EMAIL_USER}`,
        'to': req.body.email,
        'subject': "Acknowledgement",
        'text': `Thanks for being awesome!\n\nThank you ${req.body.name} for joining our Training and Placement Cell of KGEC. Your account will be verified by our admins, please wait patiently. You will receive another email when your account is verified.\n\nRegards,\nKGEC Training and Placement Cell\nKalyani Government Engineering College\nKalyani, Nadia`
      }
      await transport.sendMail(message);
      fs.unlink(`temp/upload/${req.file.filename}`);
      res.sendStatus(201);
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
});

router.post('/login', async (req, res) => {
  try {
    const company = await Company.findOne({ email: req.body.email.toLowerCase() }, { password: true, isVerified: true, isRejected: true });
    if (company === null) {
      res.sendStatus(401);
    } else {
      if (await bcrypt.compare(req.body.password, company.password)) {
        if (company.isVerified === false && company.isRejected === false) {
          res.sendStatus(403);
        } else if (company.isRejected === true) {
          res.sendStatus(406)
        }
        else {
          const token = jsonwebtoken.sign({ _id: company._id }, process.env.JWT_SECRET_KEY, { expiresIn: 2 * 60 * 60 });
          res.cookie('token', token, { sameSite: 'none', secure: true, maxAge: 2 * 60 * 60 * 1000 });
          res.sendStatus(200);
        }
      } else {
        res.sendStatus(401);

      }
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
});

router.post('/forget-password', async (req, res) => {
  try {
    const company = await Company.findOne({ email: req.body.email.toLowerCase() });
    if (company === null) {
      res.sendStatus(404);
    } else {
      const auth = await Auth.findOne({ email: req.body.email.toLowerCase() });
      if (auth !== null) {
        await Auth.deleteOne({ email: req.body.email.toLowerCase() });
      }
      const otp = crypto.randomInt(100000, 999999);
      await Auth.create({
        email: req.body.email.toLowerCase(),
        otp: otp
      });
      const transport = nodemailer.createTransport({
        'host': 'smtp-mail.outlook.com',
        'port': 587,
        'secure': false,
        'auth': {
          'user': process.env.EMAIL_USER,
          'pass': process.env.EMAIL_PASSWORD
        }
      });
      const message = {
        'from': `"KGEC Training and Placement Cell" ${process.env.EMAIL_USER}`,
        'to': req.body.email,
        'subject': "OTP for resetting password",
        'text': `The OTP for resetting your password is ${otp}.\n\nRegards,\nKGEC Training and Placement Cell\nKalyani Government Engineering College\nKalyani, Nadia`
      }
      await transport.sendMail(message);
      res.sendStatus(201);
    }
  } catch (error) {
    res.sendStatus(400);
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const auth = await Auth.findOne({ email: req.body.email.toLowerCase() });
    if (auth.otp == req.body.otp) {
      res.sendStatus(200);
    } else {
      res.sendStatus(401);
    }
  } catch (error) {
    res.sendStatus(400);
  }
});

router.put('/set-password', async (req, res) => {
  try {
    const auth = await Auth.findOne({ email: req.body.email.toLowerCase() });
    if (auth.otp == req.body.otp) {
      const password = await bcrypt.hash(req.body.password, 10);
      await Company.updateOne({ email: req.body.email.toLowerCase() }, { password: password });
      const transport = nodemailer.createTransport({
        'host': 'smtp-mail.outlook.com',
        'port': 587,
        'secure': false,
        'auth': {
          'user': process.env.EMAIL_USER,
          'pass': process.env.EMAIL_PASSWORD
        }
      });
      const message = {
        'from': `"KGEC Training and Placement Cell" ${process.env.EMAIL_USER}`,
        'to': req.body.email,
        'subject': "OTP for resetting password",
        'text': `Your password has been successfully changed.\n\nRegards,\nKGEC Training and Placement Cell\nKalyani Government Engineering College\nKalyani, Nadia`
      }
      transport.sendMail(message);
      res.sendStatus(200);
    } else {
      res.sendStatus(401);
    }
  } catch (error) {
    res.sendStatus(400);
  }
})

router.get('/', validateCompany, async (req, res) => {
  try {
    const company = await Company.findById(req._id, { password: false, _id: false, __v: false });
    res.json(company);
  } catch (error) {
    res.sendStatus(400);
  }
});

router.get('/all-jobs', validateCompany, async (req, res) => {
  try {
    res.json(await Job.find({ companyId: req._id }).populate('companyId'));
  } catch (error) {
    res.sendStatus(400);
  }
});


router.post('/applied-students', async (req, res) => {
  try {
    const job = await Job.findById(req.body.id).populate('companyId');
    const students = await Apply.find({ jobId: req.body.id }).populate('studentId');
    const workbook = new excel.Workbook()
    const worksheet = workbook.addWorksheet(job.title);
    worksheet.cell(1, 1).string('Company Name')
    worksheet.cell(1, 2).string(job.companyId.name);
    worksheet.cell(2, 1).string('Job Title')
    worksheet.cell(2, 2).string(job.title);
    worksheet.cell(4, 1).string('Name');
    worksheet.cell(4, 2).string('Date of Birth');
    worksheet.cell(4, 3).string('Gender');
    worksheet.cell(4, 4).string('Address');
    worksheet.cell(4, 5).string('Email');
    worksheet.cell(4, 6).string('Phone');
    worksheet.cell(4, 7).string('Department');
    worksheet.cell(4, 8).string('Specialization');
    worksheet.cell(4, 9).string('Passout Year');
    worksheet.cell(4, 10).string('Current Percentage');
    worksheet.cell(4, 11).string('Secondary Percentage');
    worksheet.cell(4, 12).string('Higher Secondary/Diploma Percentage');
    worksheet.cell(4, 13).string('Graduation Percentage');
    worksheet.cell(4, 14).string('Active Backlogs');
    worksheet.cell(4, 15).string('Education Gap');
    students.map(function (student, index) {
      worksheet.cell(index + 5, 1).string(student.studentId.name);
      let date = '';
      const newDate = new Date(student.studentId.dateOfBirth.toString()).toISOString();
      date = date + newDate.slice(8, 10);
      date = date + '/'
      date = date + newDate.slice(5, 7);
      date = date + '/'
      date = date + newDate.slice(0, 4);
      worksheet.cell(index + 5, 2).string(date);
      worksheet.cell(index + 5, 3).string(student.studentId.gender);
      worksheet.cell(index + 5, 4).string(student.studentId.address);
      worksheet.cell(index + 5, 5).string(student.studentId.email);
      worksheet.cell(index + 5, 6).string(student.studentId.phone.toString());
      worksheet.cell(index + 5, 7).string(student.studentId.stream);
      worksheet.cell(index + 5, 8).string(student.studentId.specialization);
      worksheet.cell(index + 5, 9).string(student.studentId.passoutYear);
      worksheet.cell(index + 5, 10).number(student.studentId.currentPercentage);
      worksheet.cell(index + 5, 11).number(student.studentId.secondaryPercentage);
      worksheet.cell(index + 5, 12).number(student.studentId.higherSecondaryPercentage);
      worksheet.cell(index + 5, 13).number(student.studentId.graduationPercentage);
      worksheet.cell(index + 5, 14).number(student.studentId.activeBacklogs);
      worksheet.cell(index + 5, 15).number(student.studentId.educationGap);
    })
    await workbook.write('excel.xlsx', function (error, status) {
      res.download(path.join(__dirname, '../', 'excel.xlsx'), `${job.companyId.name} ${job.title} Applied Students.xlsx`, function () {
        fs.unlink(path.join(__dirname, '../', 'excel.xlsx'));
      });
    });
  } catch (error) {
    console.log(error);
    res.send(400);
  }
})

router.get('/open-jobs', validateCompany, async (req, res) => {
  try {
    res.json(await Job.find({ companyId: req._id, isHistoric: false }).populate('companyId'));
  } catch (error) {
    res.sendStatus(400);
  }
});

router.delete('/job', validateCompany, async (req, res) => {
  try {
    await Job.updateOne({ _id: req.body.id }, { isHistoric: true });
    res.sendStatus(202);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
})

module.exports = router;