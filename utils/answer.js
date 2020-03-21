function handleAnswer(str) {
    str += "$";
    // 大于等于4个连续$
    var p = /[$]+/g
    str = str.replace(p, "$$$$$$");
    return str;
}

module.exports={
    handleAnswer
}