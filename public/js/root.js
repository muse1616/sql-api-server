function addTeacher() {
    let id = $("#id").val();
    let name = $("#name").val();
    let pwd = $("#pwd").val();
    if (id == "" || name == "" || pwd == "") {
        notif({
            type: "error",
            msg: "<b>信息不完整</b>"
        });
        return;
    }
    $.post({
        url: "/user/root",
        data: {
            id: id,
            name: name,
            pwd: pwd
        },
        success: function (data) {
            if (data.error != 0) {
                notif({
                    type: "error",
                    msg: "<b>" + data.msg + "</b>"
                });
            } else {
                notif({
                    type: "success",
                    msg: "<b>" + "添加成功,初始密码123456" + "</b>"
                });
            }
        }
    })
}