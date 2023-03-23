const Company = require('../models/Company');
const jsonwebtoken = require('jsonwebtoken');

async function validateCompany(req, res, next) {
  try {
    const token = jsonwebtoken.verify(req.cookies.token, process.env.JWT_SECRET_KEY);
    const company = await Company.findById(token._id, { _id: true });
    if (company !== null) {
      req._id = company._id;
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

module.exports = validateCompany;