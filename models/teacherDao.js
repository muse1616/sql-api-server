// db
const db = require('../db');
const mysql = require('mysql')
// 日期格式化共计
const format = require('../utils/date');
const time = require('../utils/time');

// name
// 创建时间
// 可见日期
// 截止日期
// 总学生/完成学生/未完成学生
async function getTestList(teacher_id) {
    let lists = [];
    const result1 = await db.sqlQuery('SELECT * FROM `' + teacher_id + '`.`__experiment`');
    for (let i = 0; i < result1.data.length; i++) {
        let table = {};
        table["name"] = result1.data[i].name;

        table["createTime"] = result1.data[i].createTime;
        table["reachTime"] = result1.data[i].reachTime;
        table["deadline"] = result1.data[i].deadline;
        if (table["createTime"] != null) {
            table["createTime"] = table["createTime"].toLocaleDateString();
        }
        if (table["reachTime"] != null) {
            table["reachTime"] = table["reachTime"].toLocaleDateString();
        }
        if (table["deadline"] != null) {
            table["deadline"] = table["deadline"].toLocaleDateString();
        }

        // 统计人数
        let sql = "select * from `" + teacher_id + "`.`grade__" + result1.data[i].name + "`";
        let result2 = await db.sqlQuery(sql);
        let all = 0;
        let finish = 0;
        for (let j = 0; j < result2.data.length; j++) {
            all++;
            if (result2.data[j].isFinish == "y") {
                finish++;
            }
        }
        table["all"] = all;
        table["finish"] = finish;
        lists[i] = table;
    }
    return lists;
}


async function deleteTest(id, name) {

    try {
        // 先从实验表中删除
        let sql = "DELETE from `" + id + "`.`__experiment` where `name` = '" + name + "'";
        await db.sqlQuery(sql);
        // 再删除实验表和成绩表
        sql = "drop table if exists `" + id + "`.`experiment__" + name + "`";
        await db.sqlQuery(sql);
        sql = "drop table if exists `" + id + "`.`grade__" + name + "`";
        await db.sqlQuery(sql);
        return {
            error: 0,
            msg: "success"
        };
    } catch (error) {
        return {
            error: -1,
            msg: error.sqlMessage
        };
    }
}

async function changeDate(id, name, date, type) {
    let sql = "select * from `" + id + "`.`__experiment` where `name` = '" + name + "'";
    let result1 = await db.sqlQuery(sql);

    // 修改的是可见日期 不能晚于deadline
    if (type == "reachTime") {
        if (result1.data[0].deadline < new Date(date)) {
            // console.log("可见日期不能晚于截止日期");
            return {
                error: -1,
                msg: "可见日期不能晚于截止日期"
            };
        } else {
            // 修改
            sql = "update `" + id + "`.`__experiment` set `reachTime` = ? where name = ?";
            await db.sqlQuery(sql, [date, name]);
            return {
                error: 0,
                msg: "修改成功"
            };
        }
    }
    // 修改的是deadline 不能早于可见日期
    if (type == "deadline") {
        if (result1.data[0].reachTime > new Date(date)) {
            // console.log("可见日期不能晚于截止日期");
            return {
                error: -1,
                msg: "可见日期不能晚于截止日期"
            };
        } else {
            // 修改
            sql = "update `" + id + "`.`__experiment` set `deadline` = ? where name = ?";
            await db.sqlQuery(sql, [date, name]);
            return {
                error: 0,
                msg: "修改成功"
            };
        }
    }
}

async function getTestTimeAndScore(teacher_id) {
    // 获取所有可见实验
    // 获得当前时间

    // 返回信息 
    let tests = [];

    let nowTime = format(new Date());
    // 获得所有可见实验
    const result1 = await db.sqlQuery('SELECT * FROM `' + teacher_id + '`.`__experiment` where `reachTime` <= ?', [nowTime]);
    // 遍历成绩表
    for (let i = 0; i < result1.data.length; i++) {
        let test = {};
        test["name"] = result1.data[i].name;
        // 进入grade表
        sql = 'select * from `' + teacher_id + '`.`grade__' + result1.data[i].name + '`';
        let result3 = await db.sqlQuery(sql);
        // 总分
        let scoreSum = 0;
        // 完成人数
        let fc = 0;
        // 总时间 换算为秒
        let timeSum = 0;
        for (let i = 0; i < result3.data.length; i++) {

            if (result3.data[i].isFinish == "y") {
                timeSum = time.timeAdd(timeSum, result3.data[i].timeUse);
                scoreSum += result3.data[i].grade;
                fc++;
            }
        }
        if (fc != 0) {
            test["averageTime"] = time.secondsToTime(parseInt(timeSum / fc));
            test["averageScore"] = parseInt(scoreSum / fc);
        } else {
            test["averageTime"] = 0;
            test["averageScore"] = 0;
        }
        tests.push(test);

    }
    return tests;

}
// 获取实验详细 目的 描述 关联库表 题目 答案
async function getTestDetail(teacher_id, name) {
    let detail = {};
    let sql = "select * from `" + teacher_id + "`.`__experiment` where `name` = '" + name + "'";
    let result1 = await db.sqlQuery(sql);
    detail["aim"] = result1.data[0].aim;
    detail["describe"] = result1.data[0].describe;
    detail["table"] = result1.data[0].table;
    sql = 'select * from `' + teacher_id + '`.`experiment__' + result1.data[0].name + '`';
    let result2 = await db.sqlQuery(sql);
    let problems = [];
    let answers = [];
    for (let i = 0; i < result2.data.length; i++) {
        problems[i] = result2.data[i].problem;
        answers[i] = result2.data[i].answer;
    }
    detail["problem"] = problems;
    detail["answer"] = answers;
    return detail;

}
async function getMyTable(teacher_id) {
    let tables = [];
    let sql = "select * from `" + teacher_id + "`.`__table`";
    let result1 = await db.sqlQuery(sql);
    for (let i = 0; i < result1.data.length; i++) {
        tables[i] = result1.data[i].name;
    }
    return tables;
}

async function getTableList(teacher_id) {
    let tables = [];
    let sql = "select * from `" + teacher_id + "`.`__table`";
    let result1 = await db.sqlQuery(sql);
    for (let i = 0; i < result1.data.length; i++) {
        let table = {};
        table["name"] = result1.data[i].name;
        table["createTime"] = result1.data[i].createTime;
        table["ex_count"] = result1.data[i].ex_count;
        tables[i] = table;
    }
    return tables;
}

async function deleteTable(teacher_id, name) {

    let sql = "select * from `" + teacher_id + "`.`__table` where `name` = ?";
    let result1 = await db.sqlQuery(sql, [name]);
    // if(result1.data[0].ex_count)
    if (result1.data.length > 0) {
        if (result1.data[0].ex_count == 0) {
            sql = "delete from `" + teacher_id + "`.`__table` where `name` = ?";
            await db.sqlQuery(sql, [name]);
            sql = "drop table if exists `" + teacher_id + "`.`" + name + "`";
            await db.sqlQuery(sql, [name]);
            return {
                error: 0,
                msg: "删除成功"
            };
        } else {
            return {
                error: -1,
                msg: "该表有实验相关联"
            };
        }
    } else {
        return {
            error: -1,
            msg: "删除失败"
        };
    }

    // return tables;
}








async function editTest(id, old_name, name, aim, describe, table, problems, answers) {
    // 更新
    // 1.更新实验表
    let sql = "update `" + id + "`.`__experiment` set `name` = ? ,`aim`= ?,`describe` = ?,`table`=? where name = ?";
    let result1 = await db.sqlQuery(sql, [name, aim, describe, table, old_name]);

    // 2修改题目 修改方式待修改 不使用删除表的方式 过于危险
    sql = "delete from `" + id + "`.`experiment__" + old_name + "`";
    await db.sqlQuery(sql);
    for (let i = 0; i < problems.length; i++) {
        answers[i] = a(answers[i]);
        sql = "insert into `" + id + "`.`experiment__" + old_name + "` values(?,?,?)";
        await db.sqlQuery(sql, [(i + 1), problems[i], answers[i]]);
    }
    // 3修改表名
    if (name != old_name) {
        sql = "ALTER  TABLE `" + id + "`.`experiment__" + old_name + "` RENAME TO `" + id + "`.`experiment__" + name + "`";
        await db.sqlQuery(sql);
        sql = "ALTER  TABLE `" + id + "`.`grade__" + old_name + "` RENAME TO `" + id + "`.`grade__" + name + "`";
        await db.sqlQuery(sql);
    }
    return {
        error: 0
    };
}

async function createTableByScript(id, name, describe, script) {

    let sql = "select * from `" + id + "`.`__table` where name = ?";
    let r = await db.sqlQuery(sql, [name])
    if (r.data.length > 0) {
        return {
            error: -1,
            msg: '该表名已经存在'
        };
    }
    if (checkScript(name, script).error != 0) {
        return checkScript(name, script);
    } else {

        try {
            // console.log("执行了");
            let d = await db.sqlQueryMuti("use `" + id + "`;" + script);
            // console.log(d);
            let sql = "insert into `" + id + "`.`__table` values(?,?,?,?)";
            db.sqlQuery(sql, [name, new Date().toLocaleDateString(), describe, 0]);
            return {
                error: 0,
                msg: '创建成功'
            }
        } catch (error) {

            return {
                error: -1,
                msg: error.sqlMessage
            };
        }
    }

}




function checkScript(name, sql) {
    sql = sql.toLowerCase();
    // 1 判断有没有create语句
    if (sql.indexOf("create") == -1) {
        return {
            error: -1,
            msg: '至少有一句`Create语句`'
        };
    }
    // 2 判断create语句数量
    if (sql.length - sql.replace(/create\s/g, "").length >= 9) {
        return {
            error: -1,
            msg: '只能有一句`Create语句`若注释中包含create关键字 请将其删除'
        };
    }
    // 3 判断表名
    let correct = [];
    correct[0] = "create table `" + name + "`";
    correct[1] = "create table " + name;
    for (let i = 0; i < correct.length; i++) {
        if (sql.indexOf(correct[i]) != -1) {
            return {
                error: 0,
                msg: 'ok'
            };
        }
    }
    return {
        error: -1,
        msg: 'Create语句异常'
    };
}



function a(str) {
    str += "$";
    // 大于等于4个连续$
    var p = /[$]+/g
    str = str.replace(p, "$$$$$$");
    return str;
}





async function getMyClass(id) {
    let myClass = [];
    let sql = 'select * from `' + id + '`.`__class`';
    let result1 = await db.sqlQuery(sql);
    // console.log(result1);
    for (let i = 0; i < result1.data.length; i++) {
        let AClass = {};
        AClass["class_id"] = result1.data[i].class_id;
        sql = 'select * from `' + id + '`.`__' + result1.data[i].class_id + '`';
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
    // console.log(JSON.stringify(myClass));
    return (myClass);
}


async function deleteAStudent(id, class_id, student_id) {
    try {
        let sql = "DELETE FROM `" + id + "`.`__" + class_id + "` WHERE id = ?";
        await db.sqlQuery(sql, [student_id]);
        sql = "DELETE FROM `user`.`student` WHERE id = ?";
        await db.sqlQuery(sql, [student_id]);
        return {
            error: 0,
            msg: '删除成功'
        };
    } catch (error) {
        return {
            error: -1,
            msg: error.sqlMessage
        };
    }
}

async function deleteAClass(id, class_id) {
    try {

        sql = "DELETE FROM `" + id + "`.`__class` WHERE class_id = ?";
        await db.sqlQuery(sql, [class_id]);
        sql = "select * FROM `" + id + "`.`__" + class_id + "`";

        let result = await db.sqlQuery(sql);
        // 注销注册
        for (let i = 0; i < result.data.length; i++) {
            sql = 'DELETE FROM `user`.`student` WHERE id = ?';
            await db.sqlQuery(sql, [result.data[i].id]);
        }
        // 删除班级表
        sql = 'drop table if exists `' + class_id + '`';
        await db.sqlQuery(sql);
        return {
            error: 0,
            msg: "删除成功"
        };

    } catch (error) {
        return {
            error: -1,
            msg: error.sqlMessage
        };
    }
}


async function addOneStudent(id, class_id, student_id, name) {
    try {
        // 判断是否注册
        sql = "select * from `user`.`student` where id = ?";
        let result1 = await db.sqlQuery(sql, [student_id]);
        if (result1.data.length > 0) {
            return {
                error: -1,
                msg: "该学号已注册"
            };
        }
        // 先注册
        sql = "insert into `user`.`student` values(?,?,?,?,?)";
        result1 = await db.sqlQuery(sql, [student_id, name, "123456", class_id, id]);
        // 加入班级
        sql = "select * from `" + id + "`.`__" + class_id + "` where id = ?";
        result1 = await db.sqlQuery(sql, [student_id]);
        if (result1.data.length > 0) {
            return {
                error: -1,
                msg: "该学号已在班级中"
            };
        }
        sql = "insert into `" + id + "`.`__" + class_id + "` values(?,?)";
        result1 = await db.sqlQuery(sql, [student_id, name]);
        return {
            error: 0,
            msg: "添加成功"
        };



    } catch (error) {
        return {
            error: -1,
            msg: error.sqlMessage
        };
    }
}

async function importClass(id, class_id, persons) {
    // 查找班级是否存在
    let sql = 'select * from `' + id + '`.`__class` where `class_id` = ?';
    let result = await db.sqlQuery(sql, [class_id]);
    if (result.data.length > 0) {
        return {
            error: -1,
            msg: "该班级已存在"
        };
    }
    // 添加班级
    sql = 'insert into `' + id + '`.`__class` values(?)';
    await db.sqlQuery(sql, [class_id]);
    // 创建表
    sql = "CREATE table if not EXISTS `" + id + "`.`__" + class_id + "` ( `id` VARCHAR(255) character set utf8, `name` VARCHAR(255) character set utf8)";
    await db.sqlQuery(sql);
    // console.log(persons);
    persons = JSON.parse(persons);
    // 循环
    // 步骤1:检查添加id是否已经存在班级中 若存在 则不加 添加重复再返回结果字符串中
    // 步骤2:id不在班级中 查找已注册学生 若已注册 则返回错误结果
    // 步骤3:id既不在班级 也不再student 为其注册 加入班级
    let wrong = [];
    let error = 0;
    let index = 0;
    for (let i = 0; i < persons.length; i++) {
        // 检查是否注册
        sql = 'select * from `user`.`student` where `id` = ?';
        let result2 = await db.sqlQuery(sql, [persons[i].id]);
        if (result2.data.length > 0) {
            wrong[index] = persons[i].id;
            index++;
            error = -1;
        } else {
            sql = "insert into `user`.`student` values(?,?,?,?,?)";
            result = await db.sqlQuery(sql, [persons[i].id, persons[i].name, "123456", class_id, id]);
            sql = 'insert into `' + id + '`.`__' + class_id + '` values(?,?)';
            result = await db.sqlQuery(sql, [persons[i].id, persons[i].name]);
        }
    }
    return {
        error: error,
        wrong: wrong
    }
}
module.exports = {
    getTestList,
    deleteTest,
    changeDate,
    getTestTimeAndScore,
    getTestDetail,
    getMyTable,
    editTest,
    getTableList,
    deleteTable,
    createTableByScript,
    getMyClass,
    deleteAStudent,
    deleteAClass,
    addOneStudent,
    importClass
};