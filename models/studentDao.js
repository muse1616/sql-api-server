// db
const db = require('../db');
// 日期格式化共计
const format = require('../utils/date');
const time = require('../utils/time');
async function getInfoOne(student_id, teacher_id) {
    // 返回信息
    let info = {
        all: 0,
        visible: 0,
        pass: 0,
        completed: 0
    };
    // 获取所有实验
    const result1 = await db.sqlQuery('SELECT * FROM `' + teacher_id + '`.`__experiment`');
    let nowTime = format(new Date());
    for (let i = 0; i < result1.data.length; i++) {
        info.all++;
        // 获取可见实验
        let rT = format(result1.data[i].reachTime);
        if (rT <= nowTime) {
            info.visible++;
        }
        // 获得完成的的
        let sql = 'select * from `' + teacher_id + '`.`grade__' + result1.data[i].name + '` where `isFinish` = "y" and `id` = "' + student_id + '" ';
        let result2 = await db.sqlQuery(sql);
        if (result2.data.length > 0) {
            info.completed++;
            if (result2.data[0].grade >= 60) {
                info.pass++;
            }
        }
    }
    return info;
}

async function getInfoTwo(student_id, teacher_id, class_id) {
    // 返回信息 
    let tests = [];

    // 获得当前时间
    let nowTime = format(new Date());
    // 获得所有可见实验
    const result1 = await db.sqlQuery('SELECT * FROM `' + teacher_id + '`.`__experiment` where `reachTime` <= ?', [nowTime]);
    for (let i = 0; i < result1.data.length; i++) {

        let test = {};
        test["name"] = result1.data[i].name;
        test["deadline"] = format(result1.data[i].deadline);

        // 当前题目数量
        let sql = 'select * from `' + teacher_id + '`.`experiment__' + result1.data[i].name + '`';
        let result2 = await db.sqlQuery(sql);
        test["problemCount"] = result2.data.length;

        // 进入grade表
        sql = 'select * from `' + teacher_id + '`.`grade__' + result1.data[i].name + '`';
        let result3 = await db.sqlQuery(sql);
        // 总分
        let scoreSum = 0;
        // 人数
        let count = 0;
        // 完成人数
        let fc = 0;
        // 总时间 换算为秒
        let timeSum = 0;
        for (let i = 0; i < result3.data.length; i++) {

            // 处理自己的row
            if (result3.data[i].id == student_id) {
                test["myScore"] = result3.data[i].grade;
                test["myTime"] = result3.data[i].timeUse;
                test["isFinish"] = result3.data[i].isFinish;
                test["timeSub"] = result3.data[i].timeSub;
                // console.log(result3.data[i].timeSub);
            }

            // 处理自己班级的row
            if (result3.data[i].class == class_id) {
                count++;
                // 学生完成测试时 计算时间和分数
                if (result3.data[i].isFinish == "y") {
                    timeSum = time.timeAdd(timeSum, result3.data[i].timeUse);
                    scoreSum += result3.data[i].grade;
                    fc++;
                }
            }


        }
        if (fc != 0 && count != 0) {
            test["averageTime"] = time.secondsToTime(parseInt(timeSum / fc));
            test["averageScore"] = parseInt(scoreSum / fc);
            test["progress"] = parseFloat(fc * 1.0 / count);
        } else {
            test["averageTime"] = 0;
            test["averageScore"] = 0;
            test["progress"] = 0;
        }

        tests.push(test);
    }


    // console.log(tests);
    return tests;
}




module.exports = {
    getInfoOne,
    getInfoTwo
};