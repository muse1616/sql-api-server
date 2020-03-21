var tablesName = [];
$(document).ready(function () {

    $.post({
        url: '/user/teacher/getTableList',
        data: {
            id: id,
        },
        success: function (json) {
            // alert(JSON.stringify(json));
            for (let i = 0; i < json.length; i++) {
                tablesName[i] = json[i].name;
                let addtr = "<tr>";
                addtr += "<td>" + (i + 1) + "</td>";
                addtr += "<td>" + json[i].name + "</td>";
                addtr += "<td>" + dateFormat(new Date(json[i].createTime).toLocaleDateString()) + "</td>";
                addtr += "<td>" + json[i].ex_count + "</td>";
                addtr += "<td>";
                addtr += '<a class="btn btn-sm btn-danger" onclick="deleteTable(\'' + json[i].name + '\',' + json[i].ex_count + ')"><i class="fa fa-trash"></i>删除</a>';
                addtr += "</td>";
                addtr += "</tr>";
                $("#table_list").append(addtr);
            }


        }
    })

    // 获取我的表
    $.post({
        url: '/test/teacher/getAllTable',
        data: {
            id: id
        },
        success: function (json) {

            // alert(JSON.stringify(json.tables[0].describe));
            alert(tablesName);
            $("#tab").append('<li class="dropdown-plus-title">关闭<b class="fa fa-angle-up"></b></li>');
            for (let j = 0; j < json.tables.length; j++) {
                let a = "<div class='div__' style='display:none' id='table_div_" + tablesName[j] + "'>";
                a += "<h4 style='text-indent:30px'>" + JSON.stringify(json.tables[j].describe) + "</h4>"
                a += "</div>"


                $("#table_content").append(a);
                $('#tab').append('<li><a onclick="openTable(\'' + tablesName[j] + '\')">' + tablesName[j] + '</a></li>')
            }

            for (var i = 0; i < json.tables.length; i++) {
                //    增加表头
                let add_content = "";
                add_content += " <div style='margin-top:50px' class=\"table-responsive\"><table id=\"table_" + (i + 1) + "\" class=\"table table-striped table-bordered w-100\">";
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


                add_content += "</tbody>";
                //    闭合元素
                add_content += "</table></div>";

                //    添加add_content
                $("#table_div_" + tablesName[i]).append(add_content);
                //    开启
                $('#table_' + (i + 1)).DataTable();

                // 第一项默认
                openTable(tablesName[0]);
            }
        }
    })




})


function inputButtob() {
    $("#inputFile").click();
}


function scriptChoose() {
    var input = document.getElementById("inputFile");
    var file = input.files[0];
    if (!!file) {
        var reader = new FileReader();
        reader.readAsText(file, 'utf8');
        reader.onload = function (ev) {
            //结果写入textarea
            document.getElementById("script_sql_content").value = this.result;

        }
    }

}

function clearScript() {

    document.getElementById("script_sql_content").value = "";

}

function uploadScript() {
    let name = $("#script_name").val();
    let describe = $("#script_describe").val();
    let script = $("#script_sql_content").val();
    if (name == "" || describe == "" || script == "") {
        notif({
            msg: "<b>请将信息填写完整</b>",
            type: "error"
        });
        return;
    }
    $.post({
        url: '/user/teacher/createTableByScript',
        data: {
            id: id,
            name: name,
            describe: describe,
            script: script
        },
        success: function (data) {
            if (data.error != 0) {
                notif({
                    msg: "<b>" + data.msg + "</b>",
                    type: "error"
                });
                return;
            } else if (data.error == 0) {
                notif({
                    msg: "<b>创建成功</b>",
                    type: "success"
                });
                setTimeout(function () {
                    window.location.reload();
                }, 1000);
            }
        }
    })
}



function openTable(name) {
    // alert(name);
    $("#currentName").text(name);
    $(".div__").hide();
    $("#table_div_" + name)[0].style.display = "block";
}


function deleteTable(name, count) {
    if (count != 0) {
        notif({
            msg: "<b>该表有实验相关联 无法删除</b>",
            type: "error"
        });
        return;
    } else if (count == 0) {
        $.post({
            url: '/user/teacher/deleteTable',
            data: {
                id: id,
                name: name
            },
            success: function (data) {
                if (data.error == 0) {
                    notif({
                        msg: "<b>删除成功</b>",
                        type: "success"
                    });
                    setTimeout(function () {
                        window.location.reload();
                    }, 1000);
                } else {
                    notif({
                        msg: "<b>删除失败</b>",
                        type: "error"
                    });
                }
            }
        })
    }
}


// 日期转化
function dateFormat(data) {
    data = data.replace(/[/]/g, "-");
    let arr = data.split("-");
    if (arr[1].length == 1) {
        arr[1] = "0" + arr[1];
    }
    if (arr[2].length == 1) {
        arr[2] = "0" + arr[2];
    }
    let str = arr[0] + "-" + arr[1] + "-" + arr[2];
    return str;
}