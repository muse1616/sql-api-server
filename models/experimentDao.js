// db
const db = require('../db');

const answerUtil = require('../utils/answer')

// 分析sql
const anlayzeSql = require('../utils/sql');

// 数字转为sql类型
const toSqlType = require('../utils/type');

async function createExperiment(id, experiment) {
    //    1.检查是否有重名的实验
    try {
        let sql = "select * from `" + id + "`.`__experiment` where name = ?";
        let result = await db.sqlQuery(sql, [experiment.name]);
        if (result.data.length > 0) {
            return {
                'status': "201",
                'data': "该实验名已存在"
            };
        }
        // 2  不存在该实验 写入实验表
        sql = "INSERT into `" + id + "`.`__experiment` VALUES (?,?,?,?,?,?,?)";
        let tableStr = '';
        // 处理table
        for (let i = 0; i < experiment.tables.length; i++) {
            tableStr += experiment.tables[i];
            tableStr += '    ';
        }

        await db.sqlQuery(sql, [experiment.name, experiment.aim, experiment.desc, tableStr, new Date().toLocaleDateString(), experiment.reachTime, experiment.deadline]);
        // 3 新建实验表
        sql = "CREATE table if not EXISTS `" + id + "`.`__experiment__" + experiment.name + "`(`id` int primary key auto_increment not null ,`problem` varchar(1000) CHARACTER set utf8,`answer` VARCHAR(1000) CHARACTER set utf8);";
        await db.sqlQuery(sql);
        // 4.新建成绩表
        sql = "CREATE table if not EXISTS `" + id + "`.`__grade__" + experiment.name + "`(`class` varchar(255) CHARACTER set utf8,`id` VARCHAR(255) CHARACTER set utf8,`name` VARCHAR(255) CHARACTER set utf8,`isFinish` VARCHAR(255) CHARACTER set utf8,`timeSub` date ,`grade` int,`answer`VARCHAR(3000) CHARACTER set utf8,`isCorrect` varchar(255))";
        await db.sqlQuery(sql);
        //  5.先查班级
        sql = "select * from `" + id + "`.`__class`";
        result = await db.sqlQuery(sql);

        // 7.加入学生
        for (let i = 0; i < result.data.length; i++) {
            sql = "select * from `" + id + "`.`__" + result.data[i].id + "`";
            let result2 = await db.sqlQuery(sql);
            for (let j = 0; j < result2.data.length; j++) {
                // 插入
                sql = "insert into `" + id + "`.`__grade__" + experiment.name + "` values (?,?,?,'n',null,0,null,null)";
                await db.sqlQuery(sql, [result.data[i].id, result2.data[j].id, result2.data[j].name]);
            }
        }
        let answers = [];
        //8存答案 问题
        for (let i = 0; i < experiment.group.length; i++) {
            answers[i] = answerUtil.handleAnswer(experiment.group[i].answer);
            sql = "insert into `" + id + "`.`__experiment__" + experiment.name + "` values(?,?,?)";
            await db.sqlQuery(sql, [(i + 1), experiment.group[i].problem, answers[i]]);
        }

        return {
            'status': 200,
            'data': "创建成功"
        };
    } catch (e) {
        return {
            'status': 400,
            'data': "服务器异常 稍后尝试"
        };
    }
}


async function getAllExperiment(teacher_id) {

    let experimentList = [];

    // 获取实验基本信息
    const result1 = await db.sqlQuery('SELECT * FROM `' + teacher_id + '`.`__experiment`');

    for (let i = 0; i < result1.data.length; i++) {
        let anExperiment = {};
        anExperiment["name"] = result1.data[i].name;
        anExperiment['aim'] = result1.data[i].aim;
        anExperiment['describe'] = result1.data[i].describe;
        anExperiment['table'] = result1.data[i].table;
        anExperiment["reachTime"] = result1.data[i].reachTime.toLocaleDateString();
        anExperiment["deadline"] = result1.data[i].deadline.toLocaleDateString();

        // 获取题目及问题
        let sql = 'select * from `' + teacher_id + '`.`__experiment__' + result1.data[i].name + '`';

        let result2 = await db.sqlQuery(sql);
        let group = [];
        for (let j = 0; j < result2.data.length; j++) {
            let a = {
                problem: result2.data[j].problem,
                answer: result2.data[j].answer
            }
            group[j] = a;
        }
        anExperiment['group'] = group;
        experimentList.push(anExperiment);
    }



    return {
        'status': 200,
        'data': experimentList
    }
}


async function editExperiment(id, name, experiment) {

    // 1.更新实验表
    let sql = "update `" + id + "`.`__experiment` set `aim`= ?,`describe` = ?,`reachTime`=?,`deadline`=? where `name` = ?";

    await db.sqlQuery(sql, [experiment.aim, experiment.describe, experiment.reachTime, experiment.deadline, name]);

    // 2 修改题目

    // 2修改题目 修改方式待修改 不使用删除表的方式 过于危险
    sql = "delete from `" + id + "`.`__experiment__" + name + "`";
    await db.sqlQuery(sql);
    for (let i = 0; i < experiment.group.length; i++) {
        let answer = answerUtil.handleAnswer(experiment.group[i].answer);
        sql = "insert into `" + id + "`.`__experiment__" + name + "` values(?,?,?)";
        await db.sqlQuery(sql, [(i + 1), experiment.group[i].problem, answer]);
    }

    return {
        'status': 200,
        'data': 'success'
    }


}

async function getVisibleExperiment(teacher_id) {
    // 获得当前可见的实验 可见日期<当前日期<截止日期
    let nowTime = new Date().toLocaleDateString();
    const result1 = await db.sqlQuery('SELECT * FROM `' + teacher_id + '`.`__experiment` where `reachTime` <= ? and `deadline` >= ?', [nowTime, nowTime]);
    let arr = [];
    for (let i = 0; i < result1.data.length; i++) {
        arr.push(result1.data[i].name);
    }
    return {
        'status': 200,
        'data': arr
    }
}


async function getExperimentInfo(teacher_id, test_name) {
    // 获取实验基本信息
    const result1 = await db.sqlQuery('SELECT * FROM `' + teacher_id + '`.`__experiment` where `name` =?', [test_name]);
    if (result1.data.length > 0) {
        let obj = {
            aim: result1.data[0].aim,
            describe: result1.data[0].describe,
            table: result1.data[0].table,
            deadline: result1.data[0].deadline.toLocaleDateString()
        }

        return {
            'status': 200,
            'data': obj
        }
    } else {
        return {
            'status': 400,
            'data': '请求参数错误'
        }
    }


}

async function getTest(teacher_id, testname) {

    // 获取题目及关联库表
    let test = {};
    // 查找题目
    let sql = 'select * from `' + teacher_id + '`.`__experiment__' + testname + '`';
    let result3 = await db.sqlQuery(sql);
    let problems = [];
    for (let i = 0; i < result3.data.length; i++) {
        problems[i] = result3.data[i].problem;
    }
    test["problems"] = problems;
    //查找关联库表
    const result1 = await db.sqlQuery('SELECT * FROM `' + teacher_id + '`.`__experiment` where `name` = ?', [testname]);
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

            let aRow = "";
            for (let a in t.data[j]) {
                aRow = aRow + t.data[j][a] + "$$$";
            }
            rows[j] = aRow;
        }
        table["rows"] = rows;
        tablesArr[i] = table;
    }
    test["tables"] = tablesArr;

    return {
        'status': 200,
        'data': test
    }
}


// 学生测试创建临时表
async function createTestTmpTable(id, teacher_id, testname) {

    // 查找需要的表
    //查找关联库表
    const result1 = await db.sqlQuery('SELECT * FROM `' + teacher_id + '`.`__experiment` where `name` = ?', [testname]);
    let tablesArr = result1.data[0].table.split("    ");
    // 去掉最后一项
    tablesArr.pop();
    for (let i = 0; i < tablesArr.length; i++) {
        // 为了安全 先进行删除操作
        let tempname = "`temp__" + teacher_id + "`.`" + id + "__" + tablesArr[i] + "`";


        sql = "DROP table if EXISTS " + tempname;

        await db.sqlQuery(sql);

        // 创建表
        let t_table = "`" + teacher_id + "`.`" + tablesArr[i] + "`";

        sql = "create table " + tempname + " like " + t_table;

        await db.sqlQuery(sql);

        sql = "insert into " + tempname + " select * from " + t_table;

        await db.sqlQuery(sql);
    }

    return {
        'status': 200,
        'data': '成功加载临时表'
    };
}



async function runTestSql(id, teacher_id, test_name, sql) {
    // 获取表
    // 查找需要的表
    //查找关联库表
    const result1 = await db.sqlQuery('SELECT * FROM `' + teacher_id + '`.`__experiment` where `name` = ?', [test_name]);
    let tablesArr = result1.data[0].table.split("    ");
    // 去掉最后一项
    tablesArr.pop();

    // 分析sql

    let sqls = anlayzeSql(sql);

    // 暂不支持多语句操作

    if (sqls.sqlCount > 1) {
        return {
            'status': -1,
            'data': "暂不支持多语句操作"
        };
    }
    if (sqls.type[0] == "DML") {
        // 替换学生sql中的数据库名
        for (let i = 0; i < tablesArr.length; i++) {
            sqls.sqls[0] = sqls.sqls[0].replace("`" + tablesArr[i] + "`", "`temp__" + teacher_id + "`.`" + id + "__" + tablesArr[i] + "`");
        }

        // 执行操作
        // 优先级
        // update == insert == delete > select
        if (sqls.sqls[0].indexOf("update") != -1 || sqls.sqls[0].indexOf("insert") != -1 || sqls.sqls[0].indexOf("delete") != -1) {
            // update/insert/delete
            try {
                let sql = sqls.sqls[0];
                let result = await db.sqlQuery(sql);
                return {
                    'status': 200,
                    'data': {
                        'type': 1,
                        'msg': "> Affected Rows " + result.data.affectedRows
                    }
                }
            } catch (error) {
                return {
                    'status': 201,
                    'data': error.sqlMessage
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
                // 保存data
                let rows = [];
                for (let i = 0; i < result.data.length; i++) {
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
                    'status': 200,
                    'data': {
                        'type': 2,
                        'msg': msg
                    }
                };

            } catch (error) {
                if (error.sqlMessage == "No database selected") {
                    // console.log("使用未知的库表");
                    return {
                        'status': 201,
                        'data': '使用未知的库表'
                    };
                } else {
                    return {
                        'status': 201,
                        'data': error.sqlMessage
                    };
                }
            }

        }

    } else {
        if (sqls.type[0] != "NULL") {
            return {
                'status': 201,
                'data': "暂不支持" + sqls.type[0] + "类型操作"
            };
        } else {
            return {
                'status': 201,
                'data': "未知操作类型" + ",暂不支持"
            };
        }
    }
}


async function testSubmit(id, teacher_id, testname, answerArr) {
    // 查找答案
    let sql = 'select * from `' + teacher_id + '`.`__experiment__' + testname + '`';
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


    // 存入数据库

    let subT = new Date().toLocaleDateString();

    sql = "update `" + teacher_id + "`.`__grade__" + testname + "` set `isFinish` = 'y',`timeSub` = '" + subT + "' , `grade` = " + grade + " ,`answer` = '" + answerQ + "' , `isCorrect` = '" + correctQ + "' where `id` = '" + id + "'";
    try {
        await db.sqlQuery(sql);
        return {
            'status': 200,
            'data': "提交成功"
        };
    } catch (error) {
        return {
            'status': 400,
            'data': "提交失败"
        };
    }

}



async function getGrade(id, teacher_id, testname) {
    // 获得成绩 问题 答案 是否正确  提交时间
    let data = {};
    let sql = "select * from `" + teacher_id + "`.`__grade__" + testname + "` where id = ?";
    let result = await db.sqlQuery(sql, id);
    // 若未完成则返回未完成即可
    if (result.data[0].isFinish == 'n') {
        return {
            'status': 201,
            'data': '该实验尚未完成'
        }
    } else if (result.data[0].isFinish == 'y') {
        data["grade"] = result.data[0].grade;
        data["answer"] = result.data[0].answer;
        data["isCorrect"] = result.data[0].isCorrect;

        if (result.data[0].timeSub != null)
            data["timeSub"] = result.data[0].timeSub.toLocaleDateString();
        else
            data['timeSub'] = null
        // 获得问题
        sql = 'select * from `' + teacher_id + '`.`__experiment__' + testname + '`';
        let result2 = await db.sqlQuery(sql);
        let problem = [];
        for (let i = 0; i < result2.data.length; i++) {
            problem[i] = result2.data[i].problem;
        }
        data["problem"] = problem;
        return {
            'status': 200,
            'data': data
        }
    } else {
        return {
            'status': 400,
            'data': '服务器错误'
        }
    }

}





module.exports = {
    createExperiment,
    getAllExperiment,
    editExperiment,
    getVisibleExperiment,
    getExperimentInfo,
    getTest,
    createTestTmpTable,
    runTestSql,
    testSubmit,
    getGrade
};
