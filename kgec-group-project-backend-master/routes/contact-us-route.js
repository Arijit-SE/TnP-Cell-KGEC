const router = require('express').Router();
const nodemailer = require('nodemailer');
const Message = require('../models/Message');

router.post('/send-message', async (req, res) => {
    try {
        const message = await Message.create({
            name: req.body.name,
            email: req.body.email.toLowerCase(),
            message: req.body.message
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
        const date = new Date(message.time);
        let mail = {
            'from': `"KGEC Training and Placement Cell" ${process.env.EMAIL_USER}`,
            'to': req.body.email,
            'subject': "Feedback Acknowledgement",
            'text': `From: ${req.body.name} • ${req.body.email}\nTime: ${date.toDateString() + ', ' + date.toLocaleString().split(', ')[1]}\nMessage:\n${req.body.message}\n\nWe have recieved your message. We will get back to you as soon as possible.\n\nRegards,\nKGEC Training and Placement Cell\nKalyani Government Engineering College\nKalyani, Nadia`
        }
        await transport.sendMail(mail);
        mail = {
            'from': `"KGEC Training and Placement Cell" ${process.env.EMAIL_USER}`,
            'to': process.env.EMAIL_USER,
            'subject': "New Message ✉",
            'text': `From: ${req.body.name} • ${req.body.email}\nTime: ${date.toDateString() + ', ' + date.toLocaleString().split(', ')[1]}\n\n${req.body.message}`
        }
        await transport.sendMail(mail);
        res.sendStatus(201);
    } catch (error) {
        res.sendStatus(400);
    }
});

module.exports = router;