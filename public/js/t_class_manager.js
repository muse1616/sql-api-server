$(document).ready(function () {
    // alert(123);
    $.post({
        url: '/user/teacher/getMyClass',
        data: {
            id: id,
        },
        success: function (json) {
            // alert(JSON.stringify(json));
            $("#tab").append('<li class="dropdown-plus-title">关闭<b class="fa fa-angle-up"></b></li>');
            for (let j = 0; j < json.length; j++) {
                let a = "<div class='div__' style='display:none' id='class_div_" + json[j].class_id + "'>";
                a += "</div>"
                $("#class_content").append(a);
                $('#tab').append('<li><a onclick="openClass(\'' + json[j].class_id + '\')">' + json[j].class_id + '</a></li>')
            }
            // 增加班级表
            for (var i = 0; i < json.length; i++) {
                //    增加表头
                let add_content = "";
                add_content += " <div style='margin-top:50px' class=\"table-responsive\"><table id=\"class_" + (i + 1) + "\" class=\"table table-vcenter table-striped table-bordered w-100\">";

                add_content += "<thead><tr>"
                add_content += "<th>序号</th>"
                add_content += "<th>学号</th>"
                add_content += "<th>姓名</th>"
                add_content += "<th>操作</th>"
                add_content += "</tr></thead>"

                //    增加tbody
                add_content += "<tbody>";
                for (let j = 0; j < json[i].student.length; j++) {
                    add_content += "<tr>";
                    add_content += "<td>" + (j + 1) + "</td>";
                    add_content += "<td>" + json[i].student[j].id + "</td>";
                    add_content += "<td>" + json[i].student[j].name + "</td>";
                    add_content += "<td><button onclick='deleteAStudent(\"" + json[i].class_id + "\",\"" + json[i].student[j].id + "\")' class='btn btn-danger'>删除</button></td>";
                    add_content += "</tr>";
                }

                add_content += "</tbody>";
                //    闭合元素
                add_content += "</table></div>";


                //    添加add_content
                $("#class_div_" + json[i].class_id).append(add_content);
                //    开启
                $('#class_' + (i + 1)).DataTable();


            }
            // 第一项默认
            openClass(json[0].class_id);






        }
    })


    $('#xlsFile').change(function (e) {
        persons = [];
        var files = e.target.files;
        var fileReader = new FileReader();
        fileReader.onload = function (ev) {
            try {
                var data = ev.target.result
                var workbook = XLSX.read(data, {
                    type: 'binary'
                }) // 以二进制流方式读取得到整份excel表格对象
            } catch (e) {
                notif({
                    type: "error",
                    msg: "<b>文件类型不正确</b>"
                });
                return;
            }
            // 表格的表格范围，可用于判断表头是否数量是否正确
            var fromTo = '';
            // 遍历每张表读取
            for (var sheet in workbook.Sheets) {
                if (workbook.Sheets.hasOwnProperty(sheet)) {
                    fromTo = workbook.Sheets[sheet]['!ref'];
                    // console.log(fromTo);
                    persons = persons.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]));
                    break;
                }
            }
            //在控制台打印出来表格中的数据
            //处理persons 判断符合要求
            if (Object.keys(persons[0]).length != 2 || !persons[0].hasOwnProperty('id') || !persons[0].hasOwnProperty('name')) {
                notif({
                    type: "error",
                    msg: "<b>所选文件格式不符合规则</b>"
                });
                $("#student_xls_preview").find("tr").remove(); //清空原有表格数据
                $("#xlsFile").val("");
                var div1 = $("#s_xls_table");
                div1[0].style.display = "none";
                persons = [];
                // alert(persons.length);
                return;
            }
            //将persons添加到table进行预览
            var div1 = $("#s_xls_table");
            div1[0].style.display = "table";
            $("#student_xls_preview").find("tr").remove(); //清空原有表格数据
            for (var i = 0; i < persons.length; i++) {
                var trHTML = "<tr><td style=\"text-align: center\">" + persons[i].id + "</td><td style=\"text-align: center\">" + persons[i].name + "</td></tr>";
                $("#student_xls_preview").append(trHTML); //添加一个字段
            }
        };
        // 以二进制方式打开文件
        fileReader.readAsBinaryString(files[0]);
    });



})

function deleteAStudent(class_id, student_id) {
    notif({
        type: "error",
        msg: "<b>确认删除该学生?此操作同时注销其注册?无法复原</b><button style='margin-left:50px' onclick='deleteS(\"" + class_id + "\",\"" + student_id + "\")' class='btn btn-outline-light'>确认</button><button style='margin-left:10px' class='btn btn-outline-light'>取消</button>",
        width: 500,
        height: 100,
        position: "center",
        opacity: 0.8
    });
}

function deleteS(class_id, student_id) {
    $.post({
        url: '/user/teacher/deleteAStudent',
        data: {
            id: id,
            class_id: class_id,
            student_id: student_id
        },
        success: function (data) {
            if (data.error == 0) {
                notif({
                    type: "success",
                    msg: "<b>删除成功</b>"
                });
                setTimeout(function () {
                    window.location.reload();
                }, 2000);
            } else {
                notif({
                    type: "error",
                    msg: "<b>删除失败</b>"
                });
            }
        }
    })

}

function openClass(class_id) {
    // alert(name);
    $("#currentClass").text(class_id);
    $(".div__").hide();
    $("#class_div_" + class_id)[0].style.display = "block";
}

function addOneModalForm() {
    let class_id = $("#currentClass").text();
    $("#addOne_class").val(class_id);
}

function deleteAClass() {
    let class_id = $("#currentClass").text();
    notif({
        type: "error",
        msg: "<b>确认删除该班级?此操作同时注销该班级学生注册?无法复原</b><button style='margin-left:50px' onclick='deleteC(\"" + class_id + "\")' class='btn btn-outline-light'>确认</button><button style='margin-left:10px' class='btn btn-outline-light'>取消</button>",
        width: 700,
        height: 100,
        position: "center",
        opacity: 0.8
    });
}

function importClass() {
    if (typeof persons === "undefined") {
        notif({
            type: "error",
            msg: "<b>未选择文件</b>"
        });
        return true;
    }

    let class_id = $("#import_class").val();
    if (persons == "" || class_id == "") {
        notif({
            type: "error",
            msg: "<b>信息填写不完整</b>"
        });
        return true;
    }
    var arrTemp = [];
    for (var i = 0; i < persons.length; i++) {
        arrTemp.push(persons[i].id);
    }
    if (isRepeat(arrTemp)) {
        return;
    }

    $.post({
        url: '/user/teacher/importClass',
        data: {
            id: id,
            class_id: class_id,
            persons: JSON.stringify(persons)
        },
        traditional: true,
        cache: false,
        success: function (data) {
            if (data.error == 0) {
                notif({
                    type: "success",
                    msg: "<b>导入成功</b>"
                });
                setTimeout(function () {
                    window.location.reload();
                }, 2000);
            } else {
                notif({
                    type: "error",
                    msg: "<b>" + data.wrong.toString() + "重复注册</b>"
                });
                setTimeout(function () {
                    window.location.reload();
                }, 2000);
            }
        }
    })
    // alert(class_id);


    // alert(JSON.stringify(persons));
}

//检测无重复id
function isRepeat(arr) {
    var hash = {};
    for (var i in arr) {
        if (hash[arr[i]]) {
            notif({
                type: "error",
                msg: "<b>文件中有重复id" + arr[i] + "</b>"
            });
            return true;
        }
        // 不存在该元素，则赋值为true
        hash[arr[i]] = true;
    }
    return false;
}


function addOne_Button() {
    let class_id = $("#currentClass").text();
    let student_id = $("#addOne_id").val();
    let name = $("#addOne_name").val();
    if (student_id == "" || name == "") {
        notif({
            type: "error",
            msg: "<b>信息不完整</b>"
        });
        return;
    } else {

        $.post({
            url: '/user/teacher/addOneStudent',
            data: {
                id: id,
                class_id: class_id,
                student_id: student_id,
                name: name

            },
            success: function (data) {
                if (data.error == 0) {
                    notif({
                        type: "success",
                        msg: "<b>添加成功</b>"
                    });
                    setTimeout(function () {
                        window.location.reload();
                    }, 2000);
                } else {
                    notif({
                        type: "error",
                        msg: "<b>添加失败</b>"
                    });

                }
            }
        })





    }
}


function deleteC(class_id) {
    $.post({
        url: '/user/teacher/deleteAClass',
        data: {
            id: id,
            class_id: class_id
        },
        success: function (data) {
            if (data.error == 0) {
                notif({
                    type: "success",
                    msg: "<b>删除成功</b>"
                });
                setTimeout(function () {
                    window.location.reload();
                }, 2000);
            } else {
                notif({
                    type: "error",
                    msg: "<b>删除失败</b>"
                });
            }
        }
    })
}