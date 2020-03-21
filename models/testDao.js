// db
const db = require('../db');
const toSqlType = require('../utils/type');
const anlayzeSql = require('../utils/sql');

async function s_getTestInfo(id, teacher_id, testname) {
    let testInfo = {};
    const result1 = await db.sqlQuery('SELECT * FROM `' + teacher_id + '`.`__experiment` where `name` = ?', [testname]);
    // console.log(result1.data[0]);
    testInfo["aim"] = result1.data[0].aim;
    testInfo["describe"] = result1.data[0].describe;
    testInfo["table"] = result1.data[0].table;
    testInfo["deadline"] = new Date(result1.data[0].deadline).toLocaleDateString();

    // 进入成绩表
    let sql = 'select * from `' + teacher_id + '`.`grade__' + result1.data[0].name + '` where `id`= ?';
    const result2 = await db.sqlQuery(sql, [id]);
    testInfo['isFinish'] = result2.data[0].isFinish;
    // 当前题目数量
    sql = 'select * from `' + teacher_id + '`.`experiment__' + result1.data[0].name + '`';
    let result3 = await db.sqlQuery(sql);
    testInfo["problemCount"] = result3.data.length;
    return testInfo;
}



async function s_getMyTest(id, teacher_id, testname) {
    let test = {};
    // 查找题目
    // 当前题目数量
    let sql = 'select * from `' + teacher_id + '`.`experiment__' + testname + '`';
    let result3 = await db.sqlQuery(sql);
    // console.log(result3.data);
    let problems = [];
    for (let i = 0; i < result3.data.length; i++) {
        problems[i] = result3.data[i].problem;
    }
    test["problems"] = problems;
    //查找关联库表
    const result1 = await db.sqlQuery('SELECT * FROM `' + teacher_id + '`.`__experiment` where `name` = ?', [testname]);
    // console.log(result1.data[0].table);
    let tables = result1.data[0].table.split("    ");
    // 去掉最后一项
    tables.pop();
    // 遍历
    let tablesArr = [];
    for (let i = 0; i < tables.length; i++) {
        let table = {};
        table["tableName"] = tables[i];
        sql = "select * from `" + teacher_id + "`.`" + tables[i] + "`";
        let t = await db.sqlQuery(sql);
        let field = new Map();
        for (let j = 0; j < t.fields.length; j++) {
            field.set(t.fields[j].name, toSqlType(t.fields[j].type));
        }
        let obj = Object.create(null);
        for (let [k, v] of field) {
            obj[k] = v;
        }
        table["field"] = obj;

        let rows = [];
        for (let j = 0; j < t.data.length; j++) {
            // console.log(t.data[j]);
            // 每一行的内容
            let aRow = "";
            for (let a in t.data[j]) {
                aRow = aRow + t.data[j][a] + "$$$";
            }
            rows[j] = aRow;
            // console.log(aRow);
        }
        table["rows"] = rows;
        // console.log("--------------------");
        tablesArr[i] = table;

    }
    test["tables"] = tablesArr;
    // console.log(test);
    return test;


}


// 学生测试创建临时表
async function s_createTempTable(id, teacher_id, testname, tables) {
    let tablesArr = tables.split(",");
    for (let i = 0; i < tablesArr.length; i++) {
        // 为了安全 先进行删除操作
        let tempname = "`temp__" + teacher_id + "`.`" + id + "__" + tablesArr[i] + "`";
        // console.log(tempname);
        sql = "DROP table if EXISTS " + tempname;
        let result = await db.sqlQuery(sql);
        // 创建表

        let t_table = "`" + teacher_id + "`.`" + tablesArr[i] + "`";
        sql = "create table " + tempname + " like " + t_table;
        let re = await db.sqlQuery(sql);

        sql = "insert into " + tempname + " select * from " + t_table;
        await db.sqlQuery(sql);
    }

    return "ok";
}

// 教师创建临时表
async function t_createTempTable(teacher_id) {
    let tablesArr = [];
    let sql = "select * from `" + teacher_id + "`.`__table`";
    let result1 = await db.sqlQuery(sql);
    for (let i = 0; i < result1.data.length; i++) {
        tablesArr[i] = result1.data[i].name;
    }
    for (let i = 0; i < tablesArr.length; i++) {
        // 为了安全 先进行删除操作
        let tempname = "`temp__" + teacher_id + "`.`" + tablesArr[i] + "`";
        // console.log(tempname);
        sql = "DROP table if EXISTS " + tempname;
        let result = await db.sqlQuery(sql);
        // 创建表
        let t_table = "`" + teacher_id + "`.`" + tablesArr[i] + "`";
        sql = "create table " + tempname + " like " + t_table;
        let re = await db.sqlQuery(sql);
        sql = "insert into " + tempname + " select * from " + t_table;
        await db.sqlQuery(sql);
    }

    return "ok";
}

// 学生测试删除临时表
async function s_deleteTempTable(id, teacher_id, testname, tables) {
    let tablesArr = tables.split(",");
    for (let i = 0; i < tablesArr.length; i++) {
        let tempname = "`temp__" + teacher_id + "`.`" + id + "__" + tablesArr[i] + "`";
        sql = "DROP table if EXISTS " + tempname;
        let result = await db.sqlQuery(sql);

    }

    return "ok";
}
async function s_runSql(id, teacher_id, tables, sql) {
    // 分析sql
    let sqls = anlayzeSql(sql);
    // console.log(sqls);
    // 暂不支持多语句操作
    if (sqls.sqlCount > 1) {
        return {
            error: -1,
            msg: "暂不支持多语句操作"
        };
    }
    if (sqls.type[0] == "DML") {
        // 处理数据库
        let tablesArr = tables.split(",");
        // console.log(tablesArr);
        // 替换学生sql中的数据库名
        for (let i = 0; i < tablesArr.length; i++) {
            sqls.sqls[0] = sqls.sqls[0].replace("`" + tablesArr[i] + "`", "`temp__" + teacher_id + "`.`" + id + "__" + tablesArr[i] + "`");
        }
        // console.log(sqls.sqls[0]);
        // 执行操作
        // 优先级
        // update == insert == delete > select
        if (sqls.sqls[0].indexOf("update") != -1 || sqls.sqls[0].indexOf("insert") != -1 || sqls.sqls[0].indexOf("delete") != -1) {
            // update/insert/delete
            try {
                let sql = sqls.sqls[0];
                let result = await db.sqlQuery(sql);
                return {
                    error: 0,
                    type: 1,
                    msg: "> Affected Rows " + result.data.affectedRows
                }
            } catch (error) {
                // console.log(error.sqlMessage)
                return {
                    error: -2,
                    msg: error.sqlMessage
                };
            }
        } else {
            // select
            try {
                let sql = sqls.sqls[0];
                let result = await db.sqlQuery(sql);
                // 先保存字段
                let fields = [];
                for (let i = 0; i < result.fields.length; i++) {
                    fields[i] = result.fields[i].name;
                }
                // console.log(fields);
                // 保存data
                let rows = [];
                for (let i = 0; i < result.data.length; i++) {
                    // console.log(result.data[i]);
                    let aRow = "";
                    for (let a in result.data[i]) {
                        aRow = aRow + result.data[i][a] + "$$$";
                    }
                    rows[i] = aRow;
                }
                let msg = {
                    fields,
                    rows
                };
                return {
                    error: 0,
                    type: 2,
                    msg: msg
                };

            } catch (error) {
                if (error.sqlMessage == "No database selected") {
                    // console.log("使用未知的库表");
                    return {
                        error: -1,
                        msg: "使用未知的库表"
                    };
                } else {
                    return {
                        error: -1,
                        msg: error.sqlMessage
                    }
                }
            }

        }

    } else {
        if (sqls.type[0] != "NULL") {
            return {
                error: -1,
                msg: "暂不支持" + sqls.type[0] + "类型操作"
            };
        } else {
            return {
                error: -1,
                msg: "未知操作类型" + ",暂不支持"
            }
        }

    }

}
async function t_runSql(teacher_id, sql) {
    // 分析sql
    let sqls = anlayzeSql(sql);
    // console.log(sqls);
    // 暂不支持多语句操作
    if (sqls.sqlCount > 1) {
        return {
            error: -1,
            msg: "暂不支持多语句操作"
        };
    }

    if (sqls.type[0] == "DML") {
        // 处理数据库
        tablesArr = [];
        let sql = "select * from `" + teacher_id + "`.`__table`";
        let result1 = await db.sqlQuery(sql);
        for (let i = 0; i < result1.data.length; i++) {
            tablesArr[i] = result1.data[i].name;
        }
        for (let i = 0; i < tablesArr.length; i++) {
            sqls.sqls[0] = sqls.sqls[0].replace("`" + tablesArr[i] + "`", "`temp__" + teacher_id + "`.`" + tablesArr[i] + "`");
        }
        // console.log(sqls.sqls[0]);
        // 执行操作
        // 优先级
        // update == insert == delete > select
        if (sqls.sqls[0].indexOf("update") != -1 || sqls.sqls[0].indexOf("insert") != -1 || sqls.sqls[0].indexOf("delete") != -1) {
            // update/insert/delete
            try {
                let sql = sqls.sqls[0];
                let result = await db.sqlQuery(sql);
                return {
                    error: 0,
                    type: 1,
                    msg: "> Affected Rows " + result.data.affectedRows
                }
            } catch (error) {
                // console.log(error.sqlMessage)
                return {
                    error: -2,
                    msg: error.sqlMessage
                };
            }
        } else {
            // select
            try {
                let sql = sqls.sqls[0];
                let result = await db.sqlQuery(sql);
                // 先保存字段
                let fields = [];
                for (let i = 0; i < result.fields.length; i++) {
                    fields[i] = result.fields[i].name;
                }
                // console.log(fields);
                // 保存data
                let rows = [];
                for (let i = 0; i < result.data.length; i++) {
                    // console.log(result.data[i]);
                    let aRow = "";
                    for (let a in result.data[i]) {
                        aRow = aRow + result.data[i][a] + "$$$";
                    }
                    rows[i] = aRow;
                }
                let msg = {
                    fields,
                    rows
                };
                return {
                    error: 0,
                    type: 2,
                    msg: msg
                };

            } catch (error) {
                if (error.sqlMessage == "No database selected") {
                    // console.log("使用未知的库表");
                    return {
                        error: -1,
                        msg: "使用未知的库表"
                    };
                } else {
                    return {
                        error: -1,
                        msg: error.sqlMessage
                    }
                }
            }

        }

    } else {
        if (sqls.type[0] != "NULL") {
            return {
                error: -1,
                msg: "暂不支持" + sqls.type[0] + "类型操作"
            };
        } else {
            return {
                error: -1,
                msg: "未知操作类型" + ",暂不支持"
            }
        }

    }

}

// 提交答案 统计成绩
async function s_submitTest(id, teacher_id, testname, answerArr, useTime) {
    // 得到正确答案
    // 此处不考虑题目变换顺序
    //查找关联库表
    let sql = 'select * from `' + teacher_id + '`.`experiment__' + testname + '`';
    let correctAnswer = await db.sqlQuery(sql);
    let correctArr = [];
    for (let i = 0; i < correctAnswer.data.length; i++) {
        correctArr[i] = correctAnswer.data[i].answer;
    }

    // 比较答案
    // 答案是否正确的序列 y n
    let record = [];
    for (let i = 0; i < correctArr.length; i++) {
        // 处理自己的答案 多余空格只保留一个 去除前后答案
        answerArr[i] = answerArr[i].replace(/\s+/g, ' ');
        answerArr[i] = answerArr[i].trim();

        let temp = correctArr[i].split("$$$");
        let bool = false;
        for (let k = 0; k < temp.length - 1; k++) {
            if (answerArr[i] == (temp[k].trim())) {
                record[i] = "y";
                bool = true;
            }
        }
        if (bool == false) {
            record[i] = "n";
        }
    }
    // 计算分数 将答案序列和正确序列存入数据库表
    let c = 0;
    for (let count = 0; count < record.length; count++) {
        if (record[count] == "y") {
            c++;
        }
    }
    // 分数
    let grade = parseInt(c * 1.0 / record.length * 100);
    // 答案序列
    let answerQ = "";
    for (let i = 0; i < answerArr.length; i++) {
        answerQ += answerArr[i];
        answerQ += "$$$";
    }
    // 正确序列
    let correctQ = "";
    for (let i = 0; i < record.length; i++) {
        correctQ += record[i];
        correctQ += "$$$";
    }
    // 查一次班级和名字 参数未传。。。
    sql = "select * from `user`.`student` where id = ?";
    let r = await db.sqlQuery(sql, [id]);
    let class_id = r.data[0].class_id;
    let name = r.data[0].name;
    // 存入数据库
    // 需要数据 
    // 1.class 2.id 3.name 4.isFinish 5.timeSub 6.timeUse 7 grade 8.answer 9.isCorrect

    let subT = new Date().toLocaleDateString();
    useTime = useTime.replace(/\s+/g, '');
    sql = "update `" + teacher_id + "`.`grade__" + testname + "` set `isFinish` = 'y',`timeSub` = '" + subT + "' ,`timeUse` = '" + useTime + "' , `grade` = " + grade + " ,`answer` = '" + answerQ + "' , `isCorrect` = '" + correctQ + "' where id = '" + id + "'";
    try {
        let re = db.sqlQuery(sql);
        return {
            error: 0,
            msg: "ok"
        };
    } catch (error) {
        return {
            error: -1,
            msg: error.sqlMessage
        };
    }

}


//
async function s_getMyGrade(id, teacher_id, testname) {
    // 获得成绩 问题 答案 是否正确 使用时间 提交时间
    let data = {};
    let sql = "select * from `" + teacher_id + "`.`grade__" + testname + "` where id = ?";
    let result = await db.sqlQuery(sql, id);
    data["grade"] = result.data[0].grade;
    data["answer"] = result.data[0].answer;
    data["isCorrect"] = result.data[0].isCorrect;
    data["timeUse"] = result.data[0].timeUse;
    data["timeSub"] = result.data[0].timeSub.toLocaleDateString();
    // 获得问题

    sql = 'select * from `' + teacher_id + '`.`experiment__' + testname + '`';
    let result2 = await db.sqlQuery(sql);
    // console.log(result2.data);
    let problem = [];
    for (let i = 0; i < result2.data.length; i++) {
        problem[i] = result2.data[i].problem;
    }
    data["problem"] = problem;
    return data;

}

async function t_getAllTable(id) {
    let test = {};
    // 获得表名
    let tables = [];
    let sql = "select * from `" + id + "`.`__table`";
    let result1 = await db.sqlQuery(sql);
    let de = [];
    for (let i = 0; i < result1.data.length; i++) {
        tables[i] = result1.data[i].name;
        de[i] = result1.data[i].describe;
    }
    // 遍历
    let tablesArr = [];
    for (let i = 0; i < tables.length; i++) {
        let table = {};
        table["tableName"] = tables[i];
        table["describe"] = de[i];
        sql = "select * from `" + id + "`.`" + tables[i] + "`";
        let t = await db.sqlQuery(sql);
        let field = new Map();
        for (let j = 0; j < t.fields.length; j++) {
            field.set(t.fields[j].name, toSqlType(t.fields[j].type));
        }
        let obj = Object.create(null);
        for (let [k, v] of field) {
            obj[k] = v;
        }
        table["field"] = obj;
        let rows = [];
        for (let j = 0; j < t.data.length; j++) {
            // console.log(t.data[j]);
            // 每一行的内容
            let aRow = "";
            for (let a in t.data[j]) {
                aRow = aRow + t.data[j][a] + "$$$";
            }
            rows[j] = aRow;
            // console.log(aRow);
        }
        table["rows"] = rows;
        // console.log("--------------------");
        tablesArr[i] = table;
    }
    test["tables"] = tablesArr;
    return test;
}


// 创建实验
async function t_createTest(id, name, aim, describe, table, reachTime, deadline, problems, answers) {
    //    1.检查是否有重名的实验
    let sql = "select * from `" + id + "`.`__experiment` where name = ?";
    let result = await db.sqlQuery(sql, [name]);
    if (result.data.length > 0) {
        console.log(1);
        return {
            error: "-1",
            msg: "该实验名已存在"
        };
    }
    // 2  不存在该实验 写入实验表
    sql = "INSERT into `" + id + "`.`__experiment` VALUES (?,?,?,?,?,?,?)";
    await db.sqlQuery(sql, [name, aim, describe, table, new Date().toLocaleDateString(), reachTime, deadline]);
    // 3 新建实验表
    sql = "CREATE table if not EXISTS `" + id + "`.`experiment__" + name + "`(`id` int primary key auto_increment not null ,`problem` varchar(1000) CHARACTER set utf8,`answer` VARCHAR(1000) CHARACTER set utf8);";
    await db.sqlQuery(sql);
    //4.为用到的表的ex_count+1 该功能待测试
    let tableArr = table.split("    ");
    for (let i = 0; i < tableArr.length - 1; i++) {
        sql = "update `" + id + "`.`__table` set ex_count=ex_count+1 where name = ?";
        await db.sqlQuery(sql, [tableArr[i]]);
    }
    // 5.新建成绩表
    sql = "CREATE table if not EXISTS `" + id + "`.`grade__" + name + "`(`class` varchar(255) CHARACTER set utf8,`id` VARCHAR(255) CHARACTER set utf8,`name` VARCHAR(255) CHARACTER set utf8,`isFinish` VARCHAR(255) CHARACTER set utf8,`timeSub` date ,`timeUse` time,`grade` int,`answer`VARCHAR(3000) CHARACTER set utf8,`isCorrect` varchar(255))";
    await db.sqlQuery(sql);
    //  6.先查班级
    sql = "select * from `" + id + "`.`__class`";
    result = await db.sqlQuery(sql);
    // 7.加入学生
    for (let i = 0; i < result.data.length; i++) {
        sql = "select * from `" + id + "`.`__" + result.data[i].class_id + "`";
        let result2 = await db.sqlQuery(sql);
        for (let j = 0; j < result2.data.length; j++) {
            sql = "insert into `" + id + "`.`grade__" + name + "` values (?,?,?,'n',null,'00:00:00',0,null,null)";
            let result3 = await db.sqlQuery(sql, [result.data[i].class_id, result2.data[j].id, result2.data[j].name]);
        }
    }
    //8存答案 问题
    for (let i = 0; i < problems.length; i++) {
        answers[i] = a(answers[i]);
        sql = "insert into `" + id + "`.`experiment__" + name + "` values(?,?,?)";
        await db.sqlQuery(sql, [(i + 1), problems[i], answers[i]]);
    }

    return {
        error: 0,
        msg: "创建成功"
    };

}

function a(str) {
    str += "$";
    // 大于等于4个连续$
    var p = /[$]+/g
    str = str.replace(p, "$$$$$$");
    return str;
}

module.exports = {
    s_getTestInfo,
    s_getMyTest,
    s_createTempTable,
    t_createTempTable,
    s_deleteTempTable,
    s_runSql,
    t_runSql,
    s_submitTest,
    s_getMyGrade,
    t_getAllTable,
    t_createTest
};