const express = require('express');

// 获取路由实例
const router = express.Router();

// jwt
const jwt = require('../utils/token')

// db
const databaseDao = require('../models/databaseDao');



router.post('/getTable', (req, res) => {
    let {
        id
    } = req.body;
    databaseDao.getTableFromDatabase(id).then((data) => {
        res.send(data);
    })
})

router.post('/getTable/one', (req, res) => {
    let {
        id,
        name
    } = req.body;
    databaseDao.getACompleteTable(id, name).then((data) => {
        res.send(data);
    })
})

router.post('/script/receive', (req, res) => {
    let {
        id,
        script
    } = req.body;

    databaseDao.script(id, script).then((data) => {
        res.send(data);
    })
})

router.post('/delete/table', (req, res) => {
    let {
        id,
        table
    } = req.body;

    databaseDao.deleteTable(id, table).then((data) => {
        res.send(data);
    })
})


router.post('/createTmpTable', (req, res) => {
    let {
        id
    } = req.body;

    databaseDao.createTmpTable(id).then((data) => {
        res.send(data);
    })
})

router.post('/runSql', (req, res) => {
    let {
        id,
        sql
    } = req.body;

    databaseDao.runSql(id,sql).then((data) => {
        res.send(data);
    })
})


// 导出模块
module.exports = router