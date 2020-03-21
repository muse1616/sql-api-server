const express = require('express');
// 获取路由实例
const router = express.Router();

const teacherDao = require('../models/teacherDao');


router.post('/teacher/getTestList', (req, res) => {
    let {
        id
    } = req.body;

    teacherDao.getTestList(id).then((data) => {
        res.send(data);
    })
})
router.post('/teacher/getTestTimeAndScore', (req, res) => {
    let {
        id
    } = req.body;

    teacherDao.getTestTimeAndScore(id).then((data) => {
        res.send(data);
    })
})

router.post('/teacher/deleteTest', (req, res) => {
    let {
        id,
        name
    } = req.body;

    teacherDao.deleteTest(id, name).then((data) => {
        res.send(data);
    })
})
router.post('/teacher/getTestDetail', (req, res) => {
    let {
        id,
        name
    } = req.body;

    teacherDao.getTestDetail(id, name).then((data) => {
        res.send(data);
    })
})
router.post('/teacher/getMyTable', (req, res) => {
    let {
        id,
    } = req.body;

    teacherDao.getMyTable(id).then((data) => {
        res.send(data);
    })
})
router.post('/teacher/editTest', (req, res) => {
    let {
        id,
        old_name,
        name,
        aim,
        describe,
        table,
        problems,
        answers
    } = req.body;
    teacherDao.editTest(id, old_name, name, aim, describe, table, problems, answers).then((data) => {
        res.send(data);
    })
})

router.post('/teacher/changeDate', (req, res) => {
    let {
        id,
        name,
        date,
        type
    } = req.body;

    teacherDao.changeDate(id, name, date, type).then((data) => {
        res.send(data);
    })
})

router.post('/teacher/getTableList', (req, res) => {
    let {
        id
    } = req.body;

    teacherDao.getTableList(id).then((data) => {
        res.send(data);
    })
})

router.post('/teacher/deleteTable', (req, res) => {
    let {
        id,
        name
    } = req.body;

    teacherDao.deleteTable(id, name).then((data) => {
        res.send(data);
    })
})
router.post('/teacher/createTableByScript', (req, res) => {
    let {
        id,
        name,
        describe,
        script
    } = req.body;

    teacherDao.createTableByScript(id, name, describe, script).then((data) => {
        res.send(data);
    })
})
router.post('/teacher/getMyClass', (req, res) => {
    let {
        id
    } = req.body;

    teacherDao.getMyClass(id).then((data) => {
        res.send(data);
    })
})

router.post('/teacher/deleteAStudent', (req, res) => {
    let {
        id,
        class_id,
        student_id
    } = req.body;

    teacherDao.deleteAStudent(id, class_id, student_id).then((data) => {
        res.send(data);
    })
})

router.post('/teacher/deleteAClass', (req, res) => {
    let {
        id,
        class_id
    } = req.body;
    teacherDao.deleteAClass(id, class_id).then((data) => {
        res.send(data);
    })
})

router.post('/teacher/addOneStudent', (req, res) => {
    let {
        id,
        class_id,
        student_id,
        name
    } = req.body;
    teacherDao.addOneStudent(id, class_id, student_id, name).then((data) => {
        res.send(data);
    })
})
router.post('/teacher/importClass', (req, res) => {
    let {
        id,
        class_id,
        persons
    } = req.body;
    teacherDao.importClass(id, class_id,persons).then((data) => {
        res.send(data);
    })
})



module.exports = router;