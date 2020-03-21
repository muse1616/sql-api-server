function login() {
    let id = $("#id").val();
    let pwd = $("#pwd").val();
    let type = $("#type").val();

    $.post({
        url: '/user/login',
        data: {
            id: id,
            pwd: pwd,
            type: type
        },
        success: function (res) {
            if(res['error']==0){
                // 判断类型
                if(type=="student"){
                    window.location.href="/studenthome";
                }else if(type=="teacher"){
                    window.location.href="/teacherhome";
                }
            }
            else if(res['error']==-1){
                alert('请将信息填写完整');
            }
            else{
                alert('账号或密码错误');
            }

        }
    })
}