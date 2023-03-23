const bcrypt = require('bcrypt');
const router = require("express").Router();
const Admin = require("../models/Admin");
const jsonwebtoken = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const validateAdmin = require('../middlewares/validate-admin');
const Apply = require('../models/Apply');
const Auth = require('../models/Auth');
const Company = require('../models/Company');
const Job = require('../models/Job');
const crypto = require('crypto')
const excel = require('excel4node');
const path = require('path');
const pcloud = require('../pcloud');
const uuid = require('uuid');
const fs = require('fs/promises');

router.post('/', async (req, res) => {
  try {
    const email = await Admin.findOne({ email: req.body.email });
    const phone = await Admin.findOne({ phone: req.body.phone });
    if (email !== null || phone !== null) {
      res.status(409).json({
        email: email !== null,
        phone: phone !== null
      });
    } else {
      await Admin.create({
        name: req.body.name,
        dateOfBirth: req.body.dateOfBirth,
        gender: req.body.gender,
        address: req.body.address,
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password
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
        'text': `Thanks for being awesome!\n\nThank you ${req.body.name} for joining the Training and Placement Cell of KGEC. Your account will be verified by other admins, please wait patiently. You will recieve another email when your account is verified.\n\nRegards,\nKGEC Training and Placement Cell\nKalyani Government Engineering College\nKalyani, Nadia`
      }
      await transport.sendMail(message);
      res.sendStatus(201);
    }
  } catch (error) {
    res.sendStatus(400);
  }
});

router.post('/login', async (req, res) => {
  try {
    const admin = await Admin.findOne({ email: req.body.email.toLowerCase() }, { password: true, isVerified: true });
    if (admin === null) {
      res.sendStatus(401);
    } else {
      if (await bcrypt.compare(req.body.password, admin.password)) {
        if (admin.isVerified === false) {
          res.sendStatus(403);
        }
        else {
          const token = jsonwebtoken.sign({ _id: admin._id }, process.env.JWT_SECRET_KEY, { expiresIn: 2 * 60 * 60 });
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

router.get('/', validateAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req._id, { password: false, _id: false, __v: false });
    res.json(admin);
  } catch (error) {
    res.sendStatus(400);
  }
});

router.get('/new-admins', validateAdmin, async (req, res) => {
  try {
    res.json(await Admin.find({ isVerified: false, isRejected: false }, { name: true, email: true, phone: true }));
  } catch (error) {
    res.sendStatus(400);
  }
})

router.post('/verify-admin', validateAdmin, async (req, res) => {
  try {
    await Admin.updateOne({ _id: req.body.id }, { isVerified: true });
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(400);
  }
})

router.post('/reject-admin', validateAdmin, async (req, res) => {
  try {
    await Admin.updateOne({ _id: req.body.id }, { isRejected: true });
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(400);
  }
})

router.post('/forget-password', async (req, res) => {
  try {
    const admin = await Admin.findOne({ email: req.body.email.toLowerCase() });
    if (admin === null) {
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
      await Admin.updateOne({ email: req.body.email.toLowerCase() }, { password: password });
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
        'subject': "Password Changed",
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

router.get('/new-companies', validateAdmin, async (req, res) => {
  try {
    res.json(await Company.find({ isVerified: false, isRejected: false }, { name: true, contactPersonName: true, email: true, phone: true, website: true }));
  } catch (error) {
    res.sendStatus(400);
  }
});

router.post('/supporting-document', validateAdmin, async (req, res) => {
  try {
    const company = await Company.findById(req.body.id, { supportingDocumentFileId: true })
    const filename = uuid.v4().concat('.pdf')
    await pcloud.downloadfile(company.supportingDocumentFileId, 'temp/download/' + filename);
    res.sendFile(path.join(__dirname, '../', 'temp', 'download', filename), function (error) {
      fs.unlink('temp/download/' + filename);
    });
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
})

router.post('/verify-company', validateAdmin, async (req, res) => {
  try {
    await Company.updateOne({ _id: req.body.id }, { isVerified: true });
    const transport = nodemailer.createTransport({
      'host': 'smtp-mail.outlook.com',
      'port': 587,
      'secure': false,
      'auth': {
        'user': process.env.EMAIL_USER,
        'pass': process.env.EMAIL_PASSWORD
      }
    });
    const updatedCompany = await Company.findById(req.body.id)
    const message = {
      'from': `"KGEC Training and Placement Cell" ${process.env.EMAIL_USER}`,
      'to': updatedCompany.email,
      'subject': "Account Verified",
      'text': `Thanks for being awesome!\n\nThank you ${updatedCompany.name} for joining our Training and Placement Cell of KGEC. Your account has been verified by our admins. Now are allowed to post your job notifications in our portal.\n\nRegards,\nKGEC Training and Placement Cell\nKalyani Government Engineering College\nKalyani, Nadia`
    }
    transport.sendMail(message);
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
})

router.post('/reject-company', validateAdmin, async (req, res) => {
  try {
    await Company.updateOne({ _id: req.body.id }, { isRejected: true });
    const transport = nodemailer.createTransport({
      'host': 'smtp-mail.outlook.com',
      'port': 587,
      'secure': false,
      'auth': {
        'user': process.env.EMAIL_USER,
        'pass': process.env.EMAIL_PASSWORD
      }
    });
    const updatedCompany = await Company.findById(req.body.id)
    const message = {
      'from': `"KGEC Training and Placement Cell" ${process.env.EMAIL_USER}`,
      'to': updatedCompany.email,
      'subject': "Account Rejected",
      'text': `Thanks for being awesome!\n\nThank you ${updatedCompany.name} for considering our Training and Placement Cell of KGEC. Alas! we can't move forward with your company.\n\nRegards,\nKGEC Training and Placement Cell\nKalyani Government Engineering College\nKalyani, Nadia`
    }
    transport.sendMail(message);
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(400);
  }
})

router.get('/new-jobs', validateAdmin, async (req, res) => {
  try {
    const jobs = await Job.find({ isVerified: false, isRejected: false }, { isHistoric: false, __v: false }).populate('companyId').lean();
    // const jobsWithQuestions = await Promise.all(jobs.map(async function (job) {
    //   job.questions = await Question.find({ jobId: job._id.toString() }, { jobId: false, __v: false }).lean();
    //   return job;
    // }));
    res.json(jobs);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
});

router.post('/verify-job', validateAdmin, async (req, res) => {
  try {
    await Job.updateOne({ _id: req.body.jobId }, { isVerified: true });
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(400);
  }
})

router.post('/reject-job', validateAdmin, async (req, res) => {
  try {
    await Job.updateOne({ _id: req.body.jobId }, { isRejected: true });
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(400);
  }
});

router.get('/all-jobs', validateAdmin, async (req, res) => {
  try {
    res.json(await Job.find().populate('companyId'));
  } catch (error) {
    res.sendStatus(400);
  }
})

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
    res.send(400);
  }
})

router.put('/name', validateAdmin, async (req, res) => {
  try {
    await Admin.updateOne({ _id: req._id }, { name: req.body.name });
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(400);
  }
});

router.get('/name', validateAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req._id, { name: true });
    res.send(admin.name.toString());
  } catch (error) {
    res.sendStatus(400);
  }
});

router.put('/dob', validateAdmin, async (req, res) => {
  try {
    await Admin.updateOne({ _id: req._id }, { dateOfBirth: req.body.dob });
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(400);
  }
});

router.get('/dob', validateAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req._id, { dateOfBirth: true });
    res.send(admin.dateOfBirth.toString());
  } catch (error) {
    res.sendStatus(400);
  }
});

router.put('/gender', validateAdmin, async (req, res) => {
  try {
    await Admin.updateOne({ _id: req._id }, { gender: req.body.gender });
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(400);
  }
});

router.get('/gender', validateAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req._id, { gender: true });
    res.send(admin.gender.toString());
  } catch (error) {
    res.sendStatus(400);
  }
});

router.put('/address', validateAdmin, async (req, res) => {
  try {
    await Admin.updateOne({ _id: req._id }, { address: req.body.address });
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(400);
  }
});

router.get('/address', validateAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req._id, { address: true });
    res.send(admin.address.toString());
  } catch (error) {
    res.sendStatus(400);
  }
});

router.put('/email', validateAdmin, async (req, res) => {
  try {
    await Admin.updateOne({ _id: req._id }, { email: req.body.email });
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(400);
  }
});

router.get('/email', validateAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req._id, { email: true });
    res.send(admin.email.toString());
  } catch (error) {
    res.sendStatus(400);
  }
});

router.put('/phone', validateAdmin, async (req, res) => {
  try {
    await Admin.updateOne({ _id: req._id }, { phone: req.body.phone });
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(400);
  }
});

router.get('/phone', validateAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req._id, { phone: true });
    res.send(admin.phone.toString());
  } catch (error) {
    res.sendStatus(400);
  }
});

module.exports = router;