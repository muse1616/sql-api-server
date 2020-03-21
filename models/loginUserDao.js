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




async function root(id, name, pwd) {
    // 检验密码
    let sql = 'select * from `user`.`root` where `pwd` = ?';
    let result1 = await db.sqlQuery(sql, [pwd]);
    if (result1.data.length > 0) {
        // 检查教师是否存在
        sql = 'select * from `user`.`teacher` where `id` = ?';
        let result2 = await db.sqlQuery(sql, [id]);
        if (result2.data.length > 0) {
            return {
                error: -1,
                msg: '教师已存在'
            };
        } else {
            // 创建教师
            sql = "insert into `user`.`teacher` values(?,?,?)";
            await db.sqlQuery(sql, [id, pwd, name]);
            sql = "create Database `" + id + "`";
            await db.sqlQuery(sql);
            sql = "create Database `temp__" + id + "`";
            await db.sqlQuery(sql);
            sql = "CREATE TABLE if not EXISTS `" + id + "`.`__table`( `name` VARCHAR(255) character set utf8, `time` date, `describe` VARCHAR(1000) character set utf8,`ex_count` int)";
            await db.sqlQuery(sql);
            sql = "CREATE TABLE if not EXISTS `" + id + "`.`__experiment`( `name` VARCHAR(255) character set utf8, `create_time` date, `describe` VARCHAR(1000) character set utf8,`aim` VARCHAR(1000) character set utf8,`deadline` date,`reachTime` date,`table` VARCHAR(255) character set utf8)";
            await db.sqlQuery(sql);
            sql = "CREATE TABLE if not EXISTS `" + id + "`.`__class`( `class_id` VARCHAR(255) character set utf8)";
            await db.sqlQuery(sql);
        }
    } else {
        return {
            error: -1,
            msg: '密码错误'
        };
    }
}

root("2018211001", "测试二", "123456");
module.exports = {
    login,
    changePwd,
    root
};