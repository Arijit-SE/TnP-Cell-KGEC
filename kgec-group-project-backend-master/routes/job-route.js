const router = require('express').Router()
const Job = require('../models/Job');
const Student = require('../models/Student');
const Apply = require('../models/Apply');
const validateStudent = require('../middlewares/validate-student');
const validateCompany = require('../middlewares/validate-company');
const Company = require('../models/Company');


router.post('/', validateCompany, async (req, res) => {
  let job = null;
  try {
    job = await Job.create({
      companyId: req._id,
      title: req.body.title,
      description: req.body.description,
      eligibleGenders: req.body.eligibleGenders,
      eligiblePassoutYear: req.body.eligiblePassoutYear,
      eligibleDepartments: req.body.eligibleDepartments,
      eligibleSpecializations: req.body.eligibleSpecializations,
      minimumCurrentPercentage: req.body.minimumCurrentPercentage,
      maximumActiveBacklogs: req.body.maximumActiveBacklogs,
      minimumSecondaryPercentage: req.body.minimumSecondaryPercentage,
      minimumHigherSecondaryPercentage: req.body.minimumHigherSecondaryPercentage,
      // minimumDiplomaPercentage: req.body.minimumDiplomaPercentage,
      minimumGraduationPercentage: req.body.minimumGraduationPercentage,
      maximumEducationGap: req.body.maximumEducationGap
      // notEligibleIfPlacedOn: req.body.notEligibleIfPlacedOn,
      // externalApplyLink: req.body.externalApplyLink
    });
    // if (req.body.questions !== undefined) {
    //   await Question.insertMany(req.body.questions.map(function (question) {
    //     return new Question({
    //       jobId: job._id.toString(),
    //       title: question.title,
    //       isRequired: question.isRequired
    //     });
    //   }));
    // }
    res.sendStatus(201);
  } catch (error) {
    if (job !== null) {
      await Job.deleteOne({ _id: job._id.toString() });
    }
    console.log(error);
    res.sendStatus(400);
  }
});

router.get('/', validateStudent, async (req, res) => {
  try {
    const jobs = await Job.find({ isHistoric: false, isVerified: true }, { isHistoric: false, __v: false }).populate('companyId').lean();
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

router.post('/apply', validateStudent, async (req, res) => {
  try {
    const job = await Job.findById(req.body.jobId);
    // const questions = await Question.find({ jobId: req.body.jobId });
    // const requiredQuestionIds = questions.filter(function (question) {
    //   return question.isRequired === true
    // }).map(function (question) {
    //   return question._id.toString();
    // });
    // let answeredQuestionIds = null;
    // if (req.body.answers !== undefined) {
    //   answeredQuestionIds = req.body.answers.map(function (answer) {
    //     return answer.questionId;
    //   });
    // }
    // requiredQuestionIds.forEach(function (_id) {
    //   if (!answeredQuestionIds.includes(_id)) {
    //     throw Error();
    //   }
    // });
    const student = await Student.findById(req._id);
    if (student.stream === null || !job.eligibleDepartments.includes(student.stream)) {
      return res.sendStatus(403);
    }
    if (student.specialization === null || !job.eligibleSpecializations.includes(student.specialization)) {
      return res.sendStatus(403);
    }
    if (student.passoutYear === null || job.eligiblePassoutYear !== student.passoutYear) {
      return res.sendStatus(403);
    }
    if (student.currentPercentage === null || student.currentPercentage < job.minimumCurrentPercentage) {
      return res.sendStatus(403);
    }
    if (student.stream !== 'BTech') {
      if (student.graduationPercentage === null || student.graduationPercentage < job.minimumGraduationPercentage) {
        return res.sendStatus(403);
      }
    }
    if (student.higherSecondaryPercentage === null || student.higherSecondaryPercentage < job.minimumHigherSecondaryPercentage) {
      return res.sendStatus(403);
    }
    if (student.secondaryPercentage === null || student.secondaryPercentage < job.minimumSecondaryPercentage) {
      return res.sendStatus(403);
    }
    if (student.activeBacklogs === null || student.activeBacklogs > job.maximumActiveBacklogs) {
      return res.sendStatus(403);
    }
    if (student.educationGap === null || student.educationGap > job.maximumEducationGap) {
      return res.sendStatus(403);
    }
    // if (job.notEligibleIfPlacedOn !== null) {
    //   const objects = await Placement.find({ studentId: req._id }, { studentId: false, _id: false, __v: false });
    //   const studentPlacedOnJobs = objects.map(function (object) {
    //     return object.jobId.toString();
    //   });
    //   let flag = false;
    //   job.notEligibleIfPlacedOn.forEach(function (jobId) {
    //     if (studentPlacedOnJobs.includes(jobId)) {
    //       flag = true;
    //     }
    //   });
    //   if (flag === true) {
    //     return res.sendStatus(403);
    //   }
    // }
    // let flag = false;
    // if (req.body.answers !== undefined) {
    //   await Promise.all(questions.map(async function (question) {
    //     try {
    //       for (let i = 0; i < req.body.answers.length; i++) {
    //         if (req.body.answers[i].questionId === question._id.toString()) {
    //           await Answer.create({
    //             questionId: question._id,
    //             studentId: req._id,
    //             answer: req.body.answers[i].answer
    //           });
    //           break;
    //         }
    //       }
    //     } catch (error) {
    //       flag = true;
    //     }
    //   }));
    // }
    // if (flag) {
    //   return res.sendStatus(400);
    // }
    await Apply.create({
      jobId: req.body.jobId,
      studentId: req._id
    });
    res.sendStatus(201);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
});

module.exports = router;