// db
const db = require('../db');


async function getClassInfo(id) {
    let myClass = [];
    let sql = 'select * from `' + id + '`.`__class`';
    let result1 = await db.sqlQuery(sql);
    for (let i = 0; i < result1.data.length; i++) {
        let AClass = {};
        AClass["class_id"] = result1.data[i].id;
        sql = 'select * from `' + id + '`.`__' + result1.data[i].id + '`';
        let students = [];
        let result2 = await db.sqlQuery(sql);
        for (let j = 0; j < result2.data.length; j++) {
            let Astudent = {};
            Astudent["id"] = result2.data[j].id;
            Astudent["name"] = result2.data[j].name;
            students[j] = Astudent;
        }
        AClass["student"] = students;
        myClass[i] = AClass;
    }
    return {
        'status': 200,
        'data': myClass
    };
}

async function deleteAStudent(id, student_id) {
    try {
        // 前端原因 没有班级号o(╯□╰)o
        // 先找学生班级 从班级名单中删除
        // 1.获得班级
        let sql = 'select * from `' + id + '`.`__class`';
        const classArr = await db.sqlQuery(sql);
        // console.log(classArr.data);
        // 遍历
        for (let i = 0; i < classArr.data.length; i++) {
            let class_id = classArr.data[i].id;
            let sqlTemp = "DELETE FROM `" + id + "`.`__" + class_id + "` WHERE id = ?";
            await db.sqlQuery(sqlTemp, [student_id]);
        }
        // 注销注册
        sql = "DELETE FROM `user`.`student` WHERE id = ?";
        await db.sqlQuery(sql, [student_id]);
        return {
            'status': 200,
            'data': '删除成功'
        };
    } catch (error) {
        return {
            'status': 400,
            'data': error.sqlMessage
        };
    }
}

async function addAStudent(id, student) {
    try {
        // 判断是否注册
        let sql = "select * from `user`.`student` where id = ?";
        let result1 = await db.sqlQuery(sql, [student.id]);
        if (result1.data.length > 0) {
            let class_id = result1.data[0].class_id;
            let teacher_id = result1.data[0].teacher_id;
            return {
                'status': 201,
                'data': "该学号已注册,班级: " + class_id + " ,教师号: " + teacher_id
            };
        }
        // 先注册
        sql = "insert into `user`.`student` values(?,?,?,?,?)";
        result1 = await db.sqlQuery(sql, [student.id, student.name, "123456", student.class, id]);
        // 加入班级
        sql = "select * from `" + id + "`.`__" + student.class + "` where id = ?";
        result1 = await db.sqlQuery(sql, [student.id]);
        if (result1.data.length > 0) {
            return {
                'status': 201,
                'data': "该学号已在班级中,数据库异常，请联系管理员"
            };
        }
        sql = "insert into `" + id + "`.`__" + student.class + "` values(?,?)";
        result1 = await db.sqlQuery(sql, [student.id, student.name]);
        return {
            'status': 200,
            'data': "添加成功"
        };

    } catch (error) {
        return {
            'status': 400,
            'data': "服务器异常"
        };
    }
}

async function deleteAClass(id, class_id) {
    try {
        // 从班级表中删除
        sql = "DELETE FROM `" + id + "`.`__class` WHERE `id` = ?";
        await db.sqlQuery(sql, [class_id]);

        // 注销注册
        sql = 'DELETE FROM `user`.`student` WHERE `class_id` = ?';
        await db.sqlQuery(sql, [class_id]);

        // 删除班级表
        sql = 'drop table if exists `' + id + '`.`__' + class_id + '`';

        await db.sqlQuery(sql);

        return {
            'status': 200,
            'data': "删除成功"
        };

    } catch (error) {
        return {
            'status': 400,
            'data': "服务器错误:" + error.sqlMessage
        }
    }
}





async function importAClass(id, class_id, classObj) {
    // 查找班级是否存在
    let sql = 'select * from `' + id + '`.`__class` where `id` = ?';
    let result = await db.sqlQuery(sql, [class_id]);
    if (result.data.length > 0) {
        return {
            'status': 201,
            'data': "该班级已存在"
        };
    }
    // 添加班级
    sql = 'insert into `' + id + '`.`__class` values(?)';
    await db.sqlQuery(sql, [class_id]);

    // 创建表
    sql = "CREATE table if not EXISTS `" + id + "`.`__" + class_id + "` ( `id` VARCHAR(255) character set utf8, `name` VARCHAR(255) character set utf8)";
    await db.sqlQuery(sql);


    // 处理班级中的重复id

    // 循环ClassObj
    // 步骤1:注册 若存在 加入错误信息 不存在正常注册
    // 步骤2:加入班级 前端已处理 不会重复
    // 已注册信息 作为返回值返回
    let exist = [];
    for (let i = 0; i < classObj.length; i++) {
        // 检查是否注册
        sql = 'select * from `user`.`student` where `id` = ?';
        let result2 = await db.sqlQuery(sql, [classObj[i].id]);
        if (result2.data.length > 0) {
            exist.push(classObj[i].id);
        } else {
            // 注册
            sql = "insert into `user`.`student` values(?,?,?,?,?)";
            await db.sqlQuery(sql, [classObj[i].id, classObj[i].name, "123456", class_id, id]);
            // 加入班级
            sql = 'insert into `' + id + '`.`__' + class_id + '` values(?,?)';
            await db.sqlQuery(sql, [classObj[i].id, classObj[i].name]);
        }
    }
    if (exist.length == 0) {
        return {
            'status': 200,
            'data': "班级导入成功"
        };
    } else {
        return {
            'status': 200,
            'data': '已导入, 其中 ' + exist.toString() + ' 已注册'
        };
    }

}

// 导出成绩
async function exportGrade(id, class_id) {
    let returnResult = [];
    // 获得所有可见实验
    let nowTime = new Date().toLocaleDateString();
    const result1 = await db.sqlQuery('SELECT * FROM `' + id + '`.`__experiment` where `reachTime` < ?', [nowTime]);
    for (let i = 0; i < result1.data.length; i++) {
        let sql = 'select * from `' + id + '`.`__grade__' + result1.data[i].name + '` where `class` = ?';
        let result2 = await db.sqlQuery(sql, [class_id])
        let obj = {};
        obj['name'] = result1.data[i].name;
        let student = [];
        for (let j = 0; j < result2.data.length; j++) {
            
            let Astudent = {
                id: result2.data[j].id,
                name: result2.data[j].name,
                grade: result2.data[j].grade
            }
            student.push(Astudent);
        }
        obj['student'] = student
        returnResult.push(obj);
    }
    // 返回结果集:
    // 返回格式需要时 [{id:name:实验A:实验B},{id:name:实验A:实验B}]


    // console.log(returnResult)
    // 封装对象
    // 假设每个实验的学生个数一样 不出bug
    let studentArr = [];
    for(let i = 0;i<returnResult[0].student.length;i++){
        studentArr.push({
            id:returnResult[0].student[i].id,
            name:returnResult[0].student[i].name
        })
    }
    // 遍历实验
    for(let i = 0;i<studentArr.length;i++){
        for(let j = 0 ; j<returnResult.length;j++){
            // console.log(returnResult[j])
            studentArr[i][returnResult[j].name]=returnResult[j].student[i].grade;
        }
    }

    return {
        'status': 200,
        'data': studentArr
    }
}


module.exports = {
    getClassInfo,
    deleteAStudent,
    addAStudent,
    deleteAClass,
    importAClass,
    exportGrade
};