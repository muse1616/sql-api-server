function changePWD() {
    let id = $("#id").val();
    let old_pwd = $("#old_pwd").val();
    let new_pwd = $("#new_pwd").val();
    let confirm_pwd = $("#confirm_pwd").val();
    let type = $("#type").val();

    if (id == "" || old_pwd == "" || new_pwd == "" || confirm_pwd == "" || type == "") {
        notif({
            msg: "<b>请将信息填写完整</b>",
            type: "error"
        });
        return;
    }
    if (new_pwd != confirm_pwd) {
        notif({
            msg: "<b>两次输入密码不一致</b>",
            type: "error"
        });
        return;
    }

    $.post({
        url: '/user/changepwd',
        data: {
            id: id,
            old_pwd: old_pwd,
            new_pwd: new_pwd,
            type: type
        },
        success: function (res) {
            notif({
                msg: "<b>" + res + "</b>",
                type: "success"
            });
            if (res == "修改成功") {
                window.location.href = "/";
            }

        }
    })

}