window.tables = [];
window.problemCount = 1;
window.allProblem = 0;
window.Problems = [];
$(document).ready(function () {


    $("#textarea").setTextareaCount({
        width: "20px",
        bgColor: " #fffffe",
        color: "#237893"
    });

    // 获取题目和关联表
    $.post({
            url: '/test/student/getTest',
            data: {
                id: id,
                teacher_id: teacher_id,
                testname: testname
            },
            success: function (json) {
                var problemsArr = json.problems;
                window.allProblem = problemsArr.length;
                if (window.allProblem == 1) {
                    $("#upButton")[0].style.display = "block";
                }
                $("#allPShow").html(window.allProblem);
                for (var i in problemsArr) {
                    window.Problems.push(problemsArr[i]);
                    var p_id = "p_id_" + (parseInt(i) + 1).toString();
                    var proHTML = "<div style='display: none' id='" + p_id + "'><div style='padding-top: 50px;padding-left: 30px'><span>题号:" + (parseInt(i) + 1) + "</span><br><span>" + problemsArr[i] + "</span></div><div style='padding-top: 150px'><textarea id='answer" + (parseInt(i) + 1).toString() + "' class=\"form-control is-valid\" spellcheck='false' style='color: black;background: #ffffff;resize: none' rows=\"4\"  placeholder=\"输入答案\"></textarea></div></div>";
                    $("#problem_div").append(proHTML);
                }
                $("#p_id_1")[0].style.display = "block";

                //先给表赋值 作为全局变量使用


                for (var i = 0; i < json.tables.length; i++) {
                    window.tables[i] = json.tables[i].tableName;
                }
                document.getElementById('textarea').innerText = "SELECT * FROM `" + json.tables[0].tableName + "`;"


                for (var i = 0; i < json.tables.length; i++) {
                    //增加表的Tab按钮
                    var addTab = "<li><a href=\"#tab" + (i + 1) + "\" id='tab_B" + (i + 1) + "'  data-toggle=\"tab\">" + json.tables[i].tableName + "</a></li>";
                    $("#tab-div").append(addTab);
                    //增加表的tab content
                    var add_content = " <div class=\"tab-pane\" id=\"tab" + (i + 1) + "\">";
                    //    增加表头
                    add_content += " <div class=\"table-responsive\"><table id=\"table_" + (i + 1) + "\" class=\"table table-striped table-bordered w-100\">";
                    //    增加th
                    var map = json.tables[i].field;
                    add_content += "<thead><tr>"
                    for (var key in map) {
                        var fieldGroup = key + " (" + map[key] + ")";
                        add_content += "<th>" + fieldGroup + "</th>";
                    }
                    add_content += "</tr></thead>"

                    //    增加tbody
                    add_content += "<tbody>";
                    /************************
                     * ***********************/

                    //遍历行
                    for (var j = 0; j < json.tables[i].rows.length; j++) {
                        var row = json.tables[i].rows[j];
                        add_content += "<tr>";
                        var arr = row.split("$$$");
                        //注意最后一项为空
                        for (var k = 0; k < arr.length - 1; k++) {
                            add_content += "<td>" + arr[k] + "</td>";
                        }
                        add_content += "</tr>";

                    }

                    /**********************
                     * *************************/
                    add_content += "</tbody>";
                    //    闭合元素
                    add_content += "</table></div></div>";
                    //    添加add_content
                    $("#tab-content").append(add_content);
                    //    开启
                    $('#table_' + (i + 1)).DataTable();

                }
                //将第一项tab设置为初始可见
                $("#tab_B1").addClass("active");
                $("#tab1").addClass("active");

                // 创建临时表
                $.post({
                    url: '/test/student/tempTableCreate',
                    data: {
                        id: id,
                        teacher_id: teacher_id,
                        testname: testname,
                        tables: window.tables.toString()
                    },
                    success: function (data) {
                        if (data != "ok") {
                            notif({
                                msg: "<b>加载临时表失败</b>",
                                type: "error"
                            });
                        }else{
                            notif({
                                msg: "<b>加载临时表成功</b>",
                                type: "success"
                            });
                        }

                    }

                })
            }
        }

    )

})


// 刷新表
function renewTables() {
    // 创建临时表
    $.post({
        url: '/test/student/tempTableCreate',
        data: {
            id: id,
            teacher_id: teacher_id,
            testname: testname,
            tables: window.tables.toString()
        },
        success: function (data) {
            if (data != "ok") {
                notif({
                    msg: "<b>刷新失败</b>",
                    type: "error"
                });
            } else {
                notif({
                    msg: "<b>刷新成功</b>",
                    type: "success"
                });
            }

        }

    })
}

function lastP() {
    if (window.problemCount == 1) {
        return;
    }
    window.problemCount -= 1;
    $("#upButton")[0].style.display = "none";
    $("#p_id_show").html(window.problemCount);
    p_div_control(problemCount);

}


function nextP() {
    if (window.problemCount == window.allProblem) {
        return;
    }
    window.problemCount += 1;
    $("#p_id_show").html(window.problemCount);
    p_div_control(problemCount);
    if (window.problemCount == window.allProblem) {
        $("#upButton")[0].style.display = "block";
    }
}

function p_div_control(p_id) {
    $("#problem_div").children().hide();
    $("#p_id_" + p_id)[0].style.display = "block";
    // alert($("#problem_div").children());
}



function up() {
    //    获取所有答案
    var answerArr = [];
    var useTime = $("#timer-countup").text();
    for (var i = 1; i <= window.allProblem; i++) {
        if ($("#answer" + i).val() == "") {
            notif({
                msg: "<b>有题目尚未作答</b>",
                type: "error"
            });
            return;
        }
        answerArr.push($("#answer" + i).val());
    }
    // alert(answerArr);
    if (confirm("确认提交答案?") == true) {
        //上传答案
        $.ajax({
            url: "/test/student/submitTest",
            type: "post",
            data: {
                id: id,
                teacher_id: teacher_id,
                testname: testname,
                answerArr: answerArr,
                useTime: useTime,
            },
            traditional: true,
            cache: false,
            success: function (data) {
                if (data.error == 0) {
                    alert("提交成功");
                    window.location.href = "/studenthome";
                } else {
                    alert("提交失败");
                    window.location.href = "/studenthome";
                }
            }
        })

    }


}

function checkleave() {
    var e = window.event || e;
    e.returnValue = ("确定离开当前页面吗？题目将不会提交");
}


// 删除临时表 暂时不提交答案
function leave() {
    //删除临时表
    $.ajax({
        url: "/test/student/tempTableDelete",
        type: "post",
        data: {
            id: id,
            teacher_id: teacher_id,
            testname: testname,
            tables: window.tables.toString()
        },
        success: function (data) {
            
        }
    })


}

function runSQL() {
    var sql = $("#textarea").val();
    sql = sql.trim();
    $.ajax({
        url: "/test/student/runSql",
        type: "post",
        data: {
            id: id,
            teacher_id: teacher_id,
            tables: window.tables.toString(),
            sql: sql
        },
        success: function (json) {
            // alert(JSON.stringify(json));
            if (json.error != 0 || json.type == 1) {
                $("#result_div").children().remove();
                var addHTML = "<span style='font-size: small;color: #2d74a3'>" + json.msg + "</span>"
                $("#result_div").append(addHTML);
            } else {
                // alert(JSON.stringify(json));
                // 格式修正
                let arr = [];
                arr[0] = "SELECT";
                // alert(JSON.stringify(json.msg.fields))
                arr[1] = json.msg.fields.length;
                for (let i = 0; i < json.msg.fields.length; i++) {
                    arr[i + 2] = json.msg.fields[i];
                }
                // 字段信息
                let index_ = 2 + json.msg.fields.length;

                // alert(json.msg.rows.toString());

                let tempA = json.msg.rows.toString().replace(/,/g, "").split("$$$");

                for (let j = 0; j < tempA.length - 1; j++) {
                    arr[index_] = tempA[j];
                    index_++;
                }
                // alert(arr);
                // SELECT, 8, name, area, population, dat, f, d, s, ss, 上海, 2000, 1000, 2020-02-24, null, null, null, null, 北京, 2000, 3000, 2020-02-26, null, null, null, null, 纽约, 2000, 4000, 2020-02-20, null, null, null, null, 山东, 100, 100, 2020-02-19, null, null, null, nul

                // 
                // 显示表格
                $("#result_div").children().remove();
                //字段数
                var columnCount = parseInt(arr[1]);
                var trHTML = "<table id=\"aa\"\n" +
                    "                style=\" border: 1px solid #0094ff;text-align: center;min-height: 150px;color: #2d74a3;border-collapse: collapse;font-size: 12px;border: 1px solid #B2CEDD;border-radius: 5px\"\n" +
                    "            class=\"w-80\">";
                trHTML = " <tr style=\";color: black;background-color: #ebf7fd;\">";
                for (var i = 1; i <= columnCount; i++) {
                    if (i == columnCount) {

                        var addTh = "<td style=' border: 1px solid #0094ff; text-align: center;'>" + arr[i + 1] + "</td>";
                        trHTML += addTh;
                    } else {
                        var addTh = "<td style=' border: 1px solid #0094ff; border-right: none;text-align: center;'>" + arr[i + 1] + "</td>";
                        trHTML += addTh;
                    }

                }
                trHTML += "</tr>";
                //在获取内部内容


                //    先算有几行内容
                var sum_line = (arr.length - 2) / arr[1] - 1;
                var index = 2 + columnCount;
                for (var row_count = 1; row_count <= sum_line; row_count++) {
                    trHTML += "<tr style='background: #ffffff;'>";
                    for (var column_count = 1; column_count <= columnCount; column_count++) {
                        if (column_count == columnCount) {
                            trHTML += "<td style=' border: 1px solid #0094ff;border-top: none;text-align: center;' height='15px' width='100px'>" + arr[index] + "</td>";
                            index++;
                        } else {
                            trHTML += "<td style=' border: 1px solid #0094ff;border-top: none;border-right: none;text-align: center;' height='15px' width='100px'>" + arr[index] + "</td>";
                            index++;
                        }

                    }
                    trHTML += "</tr>"
                }
                trHTML += ""
                trHTML += "</table>";
                $("#result_div").append(trHTML);


            }
        }
    })
}