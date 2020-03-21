$(document).ready(function () {
    $.post({
        url: "/test/student/testInfo",
        data: {
            id: id,
            teacher_id: teacher_id,
            testname: testname
        },
        success: function (json) {
            if (json.isFinish == "n") {
                // 打开面板
                $("#grade_body")[0].style.display = "block";
                       
                let t = '<button onclick="goToTest()" style="display:block;margin:0 auto;margin-top:150px" type="button" class="btn btn-danger">去完成<i class="fa fa-link fa-spin ml-2"></i></button>';
                $("#grade_body").append("<h2 style='text-align:center'>实验尚未完成,无法查看成绩</h2>");
                $("#grade_body").append(t);

            } else if (json.isFinish == "y") {
                $.post({
                    url: "/test/student/testGrade",
                    data: {
                        id: id,
                        teacher_id: teacher_id,
                        testname: testname
                    },
                    success: function (json) {
                        // 打开面板
                        $("#a")[0].style.display = "none";
                        $("#finishShow")[0].style.display = "block";
                       
                        $("#gradeShow").text(json.grade);
                        let arr = json.timeUse.split(":");
                        $("#h").text(arr[0]);
                        $("#m").text(arr[1]);
                        $("#s").text(arr[2]);
                        $("#subTime").text(json.timeSub);
                        $('.counter').countUp();


                        // 加载题目
                        //  格式
                        // <p class="font-weight-semibold">题目:</p>
                        // <p style="text-indent: 20px;">问题1</p>
                        // <p class="font-weight-semibold">我的作答:</p>
                        // <p style="text-indent: 20px;">select * from `table` where name = "adsasd"</p>
                        // <a class="fa fa-check"></a><a class="fa fa-close"></a>
                        // <hr>
                        // alert(JSON.stringify(json));
                        // {"grade":100,"answer":"1.1$$$",
                        // "isCorrect":"y$$$","timeUse":"00:00:11","timeSub":"2020-2-17","problem":["1"]}
                        
                        // 处理答案和测试
                        let answers = json.answer.split("$$$");
                        let isCorrect = json.isCorrect.split("$$$");
                        for(let i = 0 ;i<json.problem.length;i++){
                            let addHtml = "";
                            addHtml+='<p class="font-weight-semibold">题目:</p>';
                            addHtml+='<p style="text-indent: 20px;">'+json.problem[i]+'</p>';
                            addHtml+='<p class="font-weight-semibold">我的作答:</p>';
                            addHtml+='<p style="text-indent: 20px;">'+answers[i];
                            if(isCorrect[i]=="y"){
                                addHtml+='<a class="fa fa-check"></a></p><hr>';
                            }else{
                                addHtml+='<a class="fa fa-close"></a></p><hr>';
                            }
                            $("#pShow").append(addHtml);
                        }



                    }
                })
            }
        }
    })
})

function goToTest() {
    window.location.href = "/student/mytest?teacher_id=" + teacher_id + "&testname=" + testname + "&id=" + id;
}