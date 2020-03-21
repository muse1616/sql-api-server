// 计算总时间 a为总秒数 b为xx:xx:xx 字符串
function timeAdd(a,b){
    let arr = b.split(":");
    let sumSeconds = 0 ;
    sumSeconds = parseInt(arr[0])*3600+parseInt(arr[1])*60+parseInt(arr[2]);
    let result = parseInt(a+sumSeconds);
    // console.log(result);
    return result ;
}
function  secondsToTime(a) {
    // console.log(a);
    let min = parseInt(a%3600/60);
    return min;

}


module.exports={timeAdd,secondsToTime};