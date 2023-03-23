require("dotenv/config");
const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');

require("mongoose").connect(process.env.MONGODB_URI);

const server = express();
server.use(cors({ origin: 'http://localhost', 'credentials': true }));
server.use(cookieParser());
server.use(express.json());
server.use("/student", require("./routes/student-route"));
server.use("/company", require("./routes/company-route"));
server.use("/contact-us", require("./routes/contact-us-route"));
server.use("/admin", require("./routes/admin-route"));
server.use("/job", require("./routes/job-route"));

server.listen(process.env.PORT);
