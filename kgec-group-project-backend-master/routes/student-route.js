const bcrypt = require('bcrypt');
const router = require("express").Router();
const Student = require("../models/Student");
const jsonwebtoken = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const validateStudent = require('../middlewares/validate-student');
const Apply = require('../models/Apply');
const Auth = require('../models/Auth');
const crypto = require('crypto');

router.post('/', async (req, res) => {
  try {
    const email = await Student.findOne({ email: req.body.email });
    const phone = await Student.findOne({ phone: req.body.phone });
    if (email !== null || phone !== null) {
      res.status(409).json({
        email: email !== null,
        phone: phone !== null
      });
    } else {
      await Student.create({
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
        'subject': "Sign Up Successful",
        'text': `Thanks for being awesome!\n\nThank you ${req.body.name} for joining the Training and Placement Cell of KGEC. We're sure that you will be placed in a leading company with a great salary. To get started, apply to the available jobs listed on the 'Jobs' section. Good luck for your placement journey.\n\nRegards,\nKGEC Training and Placement Cell\nKalyani Government Engineering College\nKalyani, Nadia`
      }
      await transport.sendMail(message);
      res.sendStatus(201);
    }
  } catch (error) {
    res.sendStatus(400);
  }
});

router.put('/stream', validateStudent, async (req, res) => {
  try {
    await Student.updateOne({ _id: req._id }, { stream: req.body.stream });
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(400);
  }
});

router.get('/stream', validateStudent, async (req, res) => {
  try {
    const stream = await Student.findById(req._id, { stream: true });
    res.send(stream.stream);
  } catch (error) {
    res.sendStatus(400);
  }
});

router.put('/specialization', validateStudent, async (req, res) => {
  try {
    await Student.updateOne({ _id: req._id }, { specialization: req.body.specialization });
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(400);
  }
});

router.get('/specialization', validateStudent, async (req, res) => {
  try {
    const specialization = await Student.findById(req._id, { specialization: true });
    res.send(specialization.specialization);
  } catch (error) {
    res.sendStatus(400);
  }
});

router.put('/passoutYear', validateStudent, async (req, res) => {
  try {
    await Student.updateOne({ _id: req._id }, { passoutYear: req.body.passoutYear });
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(400);
  }
});

router.get('/passoutYear', validateStudent, async (req, res) => {
  try {
    const passoutYear = await Student.findById(req._id, { passoutYear: true });
    res.send(passoutYear.passoutYear);
  } catch (error) {
    res.sendStatus(400);
  }
});

router.put('/currentPercentage', validateStudent, async (req, res) => {
  try {
    await Student.updateOne({ _id: req._id }, { currentPercentage: req.body.currentPercentage });
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(400);
  }
});

router.get('/currentPercentage', validateStudent, async (req, res) => {
  try {
    const currentPercentage = await Student.findById(req._id, { currentPercentage: true });
    res.send(currentPercentage.currentPercentage.toString());
  } catch (error) {
    res.sendStatus(400);
  }
});

router.put('/graduationPercentage', validateStudent, async (req, res) => {
  try {
    await Student.updateOne({ _id: req._id }, { graduationPercentage: req.body.graduationPercentage });
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(400);
  }
});

router.get('/graduationPercentage', validateStudent, async (req, res) => {
  try {
    const graduationPercentage = await Student.findById(req._id, { graduationPercentage: true });
    res.send(graduationPercentage.graduationPercentage.toString());
  } catch (error) {
    res.sendStatus(400);
  }
});

router.put('/higherSecondaryPercentage', validateStudent, async (req, res) => {
  try {
    await Student.updateOne({ _id: req._id }, { higherSecondaryPercentage: req.body.higherSecondaryPercentage });
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(400);
  }
});

router.get('/higherSecondaryPercentage', validateStudent, async (req, res) => {
  try {
    const higherSecondaryPercentage = await Student.findById(req._id, { higherSecondaryPercentage: true });
    res.send(higherSecondaryPercentage.higherSecondaryPercentage.toString());
  } catch (error) {
    res.sendStatus(400);
  }
});

router.put('/secondaryPercentage', validateStudent, async (req, res) => {
  try {
    await Student.updateOne({ _id: req._id }, { secondaryPercentage: req.body.secondaryPercentage });
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(400);
  }
});

router.get('/secondaryPercentage', validateStudent, async (req, res) => {
  try {
    const secondaryPercentage = await Student.findById(req._id, { secondaryPercentage: true });
    res.send(secondaryPercentage.secondaryPercentage.toString());
  } catch (error) {
    res.sendStatus(400);
  }
});

router.put('/activeBacklogs', validateStudent, async (req, res) => {
  try {
    await Student.updateOne({ _id: req._id }, { activeBacklogs: req.body.activeBacklogs });
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(400);
  }
});

router.get('/activeBacklogs', validateStudent, async (req, res) => {
  try {
    const activeBacklogs = await Student.findById(req._id, { activeBacklogs: true });
    res.send(activeBacklogs.activeBacklogs.toString());
  } catch (error) {
    res.sendStatus(400);
  }
});

router.put('/educationGap', validateStudent, async (req, res) => {
  try {
    await Student.updateOne({ _id: req._id }, { educationGap: req.body.educationGap });
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(400);
  }
});

router.get('/educationGap', validateStudent, async (req, res) => {
  try {
    const educationGap = await Student.findById(req._id, { educationGap: true });
    res.send(educationGap.educationGap.toString());
  } catch (error) {
    res.sendStatus(400);
  }
});

router.post('/login', async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.body.email.toLowerCase() }, { password: true });
    if (student === null) {
      res.sendStatus(401);
    } else {
      if (await bcrypt.compare(req.body.password, student.password)) {
        const token = jsonwebtoken.sign({ _id: student._id }, process.env.JWT_SECRET_KEY, { expiresIn: 2 * 60 * 60 });
        res.cookie('token', token, { sameSite: 'none', secure: true, maxAge: 2 * 60 * 60 * 1000 });
        res.sendStatus(200);
      } else {
        res.sendStatus(401);
      }
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
});

router.get('/', validateStudent, async (req, res) => {
  try {
    const student = await Student.findById(req._id, { password: false, _id: false, __v: false });
    res.json(student);
  } catch (error) {
    res.sendStatus(400);
  }
});

router.get('/applied-jobs', validateStudent, async (req, res) => {
  try {
    const appliedJobObjects = await Apply.find({ studentId: req._id });
    const result = appliedJobObjects.map(function (object) {
      return object.jobId.toString();
    });
    res.send(result);
  } catch (error) {
    res.sendStatus(400);
  }
});

router.post('/forget-password', async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.body.email.toLowerCase() });
    if (student === null) {
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
      await Student.updateOne({ email: req.body.email.toLowerCase() }, { password: password });
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

module.exports = router;