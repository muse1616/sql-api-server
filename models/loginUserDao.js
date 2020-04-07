// db
const db = require('../db');


// 登录
async function login(id, pwd, type) {

    // 查询
    const result1 = await db.sqlQuery('select * from `user`.`' + type + '` where id= ? and pwd = ?', [id, pwd]);

    // 账号正确
    if (result1.data.length > 0) {
        // 删除密码 返回
        delete result1.data[0].pwd
        // 封装对象
        return {
            "status": 200,
            "meta": {
                "data": result1.data[0]
            }
        };
    } else {
        return {
            "status": 201,
            "meta": {
                "data": null
            }
        };
    }

}


// 修改密码
async function changePwd(id, old_pwd, new_pwd, type) {
    // 判断密码正确
    const result1 = await db.sqlQuery('select * from `user`.`' + type + '` where id= ? and pwd = ?', [id, old_pwd]);
    if (result1.data.length == 0) {
        return {
            'status': 201,
            'data': '密码错误'
        };
    } else {
        const r = await db.sqlQuery('update `user`.`' + type + '` set pwd = ? where id = ?', [new_pwd, id]);
        if (r.data.changedRows > 0) {
            return {
                'status': 200,
                'data': '修改成功'
            };;
        } else {
            return {
                'status': 400,
                'data': '服务器错误'
            };
        }
    }
}




async function root(form) {
    // console.log(form)
         // 检验密码
    let sql = 'select * from `user`.`root` where `pwd` = ?';
    let result1 = await db.sqlQuery(sql, [form.pwd]);

    if (result1.data.length > 0) {
        // 检查教师是否存在
        sql = 'select * from `user`.`teacher` where `id` = ?';
        let result2 = await db.sqlQuery(sql, [form.teacher_id]);
        if (result2.data.length > 0) {
            return {
                'status': 201,
                'data': '教师已存在'
            };
        } else {
            // 创建教师
            sql = "insert into `user`.`teacher` values(?,?,?)";
            await db.sqlQuery(sql, [form.teacher_id, '123456', form.teacher_name]);
            sql = "create Database `" + form.teacher_id + "` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci";
            await db.sqlQuery(sql);
            sql = "create Database `temp__" + form.teacher_id + "` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci";
            await db.sqlQuery(sql);
            sql = "CREATE TABLE if not EXISTS `" + form.teacher_id + "`.`__experiment`( `name` VARCHAR(255) character set utf8,`aim` VARCHAR(500) character set utf8, `describe` VARCHAR(1000) character set utf8,`table` VARCHAR(255) character set utf8,  `createTime` date,`reachTime` date,`deadline` date)";
            await db.sqlQuery(sql);
            sql = "CREATE TABLE if not EXISTS `" + form.teacher_id + "`.`__class`( `id` VARCHAR(255) character set utf8)";
            await db.sqlQuery(sql);
            return {
                'status': 200,
                'data': '成功'
            };
        }
    } else {
        return {
             'status': 201,
            'data': '密码错误'
        };
    }
}




module.exports = {
    login,
    changePwd,
    root
};
