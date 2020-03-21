const express = require('express');
// 获取路由实例
const router = express.Router();

const studentDao = require('../models/studentDao');


router.post('/student/info_one', (req, res) => {
    let {
        id,
        name,
        class_id,
        teacher_id
    } = req.body;

    studentDao.getInfoOne(id, teacher_id).then((data) => {
        res.send(data);
    })
})

router.post('/student/info_two', (req, res) => {
    let {
        id,
        name,
        class_id,
        teacher_id
    } = req.body;

    studentDao.getInfoTwo(id, teacher_id, class_id).then((data) => {
        res.send(data);
    })
})


module.exports = router;