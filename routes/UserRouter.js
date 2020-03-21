const express = require('express');
// 获取路由实例
const router = express.Router();
// db
const db = require('../db');

const loginDao = require('../models/loginUserDao');


/**
 * @api {post} /user/login 用户登录接口
 * @apiName 用户登录
 * @apiGroup User
 *
 * @apiParam {String} id 用户工号/学号.
 * @apiParam {String} pwd 用户密码.
 * @apiParam {String} type 用户类型 student-学生 teacher-教师.
 *
 * @apiSuccess {json} info  {"err":0,"msg":data}
 */
router.post('/login', (req, res) => {
    let {
        id,
        pwd,
        type
    } = req.body;
    if (!id || !pwd || !type) {
        return res.send({
            "error": -1,
            "msg": "参数缺少"
        });
    }
    loginDao.login(id, pwd, type).then((data) => {
        if (data["error"] == 0) {

            // 删除密码信息
            delete data['msg'].pwd;
            if (data['msg'].teacher_id != undefined) {
                req.session.login = true;
                req.session.type = "student";
                req.session.user = data['msg'];
            } else {
                req.session.login = true;
                req.session.type = "teacher";
                req.session.user = data['msg'];
            }
            return res.send(data);
        }
        // 账号或密码错误
        else {
            return res.send(data);
        }
    })

})




router.post('/changepwd', (req, res) => {
    let {
        id,
        old_pwd,
        new_pwd,
        type
    } = req.body;
    loginDao.changePwd(id, old_pwd, new_pwd, type).then((data) => {
        res.send(data);
    })
})


router.post('/root', (req, res) => {
    let {
        id,
        name,
        pwd
    } = req.body;
    loginDao.root(id, name, pwd).then((data) => {
        res.send(data);
    })
})



/**
 * @api {post} /user/logOut 用户退出登录
 * @apiName 退出登录
 * @apiGroup User
 *
 */
router.post('/logOut', (req, res) => {
    req.session.destroy();
})



module.exports = router;