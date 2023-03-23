const Student = require('../models/Student');
const jsonwebtoken = require('jsonwebtoken');

async function validateStudent(req, res, next) {
    try {
        const token = jsonwebtoken.verify(req.cookies.token, process.env.JWT_SECRET_KEY);
        const student = await Student.findById(token._id, { _id: true });
        if (student !== null) {
            req._id = student._id;
            next();
        } else {
            throw Error();
        }
    } catch (error) {
        console.log(error);
        res.clearCookie('token');
        res.sendStatus(401);
    }
}

module.exports = validateStudent;