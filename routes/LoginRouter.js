const express = require('express');

// 获取路由实例
const router = express.Router();

// jwt
const jwt = require('../utils/token')

// db
const loginUserDao = require('../models/loginUserDao');


router.post('/login', (req, res) => {
    let {
        id,
        pwd,
        type
    } = req.body;

    // 登录验证
    loginUserDao.login(id, pwd, type).then((result) => {

        // 登录成功
        if (result.status == 200) {
            // 生成token
            let token = jwt.createToken(result.meta.data.id)
            result['token'] = token
            res.json(result)
        }
        // 账号或密码错误
        else {
            res.json(result)
        }
    })
})


// 修改密码
router.post('/changepwd', (req, res) => {
    let {
        id,
        old_pwd,
        new_pwd,
        type
    } = req.body;

    loginUserDao.changePwd(id, old_pwd, new_pwd, type).then((data) => {
        res.send(data);
    })
})



// 导出模块
module.exports = router