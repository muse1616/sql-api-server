const express = require('express');
// 获取路由实例
const router = express.Router();
// db
const db = require('../db');

const testDao = require('../models/testDao');

router.post('/student/testInfo', (req, res) => {
    let {
        id,
        teacher_id,
        testname
    } = req.body;
    testDao.s_getTestInfo(id, teacher_id, testname).then((data) => {
        // console.log(JSON.stringify(data));
        res.send(data);
    })
})



router.post('/student/testGrade', (req, res) => {
    let {
        id,
        teacher_id,
        testname
    } = req.body;
    testDao.s_getMyGrade(id, teacher_id, testname).then((data) => {
        res.send(data);
    })
})




router.post('/student/getTest', (req, res) => {
    let {
        id,
        teacher_id,
        testname
    } = req.body;
    testDao.s_getMyTest(id, teacher_id, testname).then((test) => {

        res.send(test);
    })
})


router.post('/teacher/getAllTable', (req, res) => {
    let {
        id
    } = req.body;
    testDao.t_getAllTable(id).then((test) => {
        res.send(test);
    })
})
router.post('/student/tempTableCreate', (req, res) => {
    let {
        id,
        teacher_id,
        testname,
        tables
    } = req.body;
    testDao.s_createTempTable(id, teacher_id, testname, tables).then((data) => {
        res.send(data);
    }).catch((err) => {
        res.send(err);
    })
})
router.post('/teacher/tempTableCreate', (req, res) => {
    let {
        id,
    } = req.body;
    testDao.t_createTempTable(id).then((data) => {
        res.send(data);
    }).catch((err) => {
        res.send(err);
    })
})
router.post('/teacher/createTest', (req, res) => {
    let {
        id,
        name,
        aim,
        describe,
        table,
        reachTime,
        deadline,
        problems,
        answers
    } = req.body;
    testDao.t_createTest(id, name,aim,describe,table,reachTime,deadline,problems,answers).then((data) => {
        res.send(data);
    }).catch((err) => {
        res.send(err);
    })
})
router.post('/student/tempTableDelete', (req, res) => {
    let {
        id,
        teacher_id,
        testname,
        tables
    } = req.body;
    testDao.s_deleteTempTable(id, teacher_id, testname, tables).then((data) => {
        res.send(data);
    }).catch((err) => {
        res.send(err);
    })
})

router.post('/student/runSql', (req, res) => {
    let {
        id,
        teacher_id,
        tables,
        sql
    } = req.body;
    testDao.s_runSql(id, teacher_id, tables, sql).then((data) => {
        res.send(data);
    })
})
router.post('/teacher/runSql', (req, res) => {
    let {
        id,
        sql
    } = req.body;
    testDao.t_runSql(id, sql).then((data) => {
        res.send(data);
    })
})

router.post('/student/submitTest', (req, res) => {
    let {
        id,
        teacher_id,
        testname,
        answerArr,
        useTime
    } = req.body;
    testDao.s_submitTest(id, teacher_id, testname, answerArr, useTime).then((data) => {
        res.send(data);
    })
})








module.exports = router;