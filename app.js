//引入express框架
const express = require('express');
// path模块
const path = require('path');
// 解析post
const bodyParser = require('body-parser');
// 解决跨域
const cors = require('cors');
// token模块
const jwt = require('./utils/token')

//实例化
const app = express();

// 解析格式
app.use(bodyParser.urlencoded({
    extended: false,
    limit: '50mb'
}));
app.use(bodyParser.json({
    limit: '50mb'
}));

// 跨域设置
app.use(cors());


// 路由注册
const loginRouter = require('./routes/LoginRouter');
const databaseRouter = require('./routes/databaseRouter');
const classRouter = require('./routes/classRouter');
const experimentRouter = require('./routes/experimentRouter');




// 路由拦截
// 路由拦截
app.all('*', function (req, res, next) {
    //设置跨域
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild')
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS')
    //登录请求不需要验证
    if (! (req.url.match(/login/) || req.url.match(/root/))) {
        // 验证
        let result = jwt.verifyToken(req.headers)
        result.then(() => {
            next()
        }).catch(() => {
            return res.send({
                'status': 202,
                data: null
            })
        })
    } else {
        next()
    }
})

// 路由使用
app.use('/server/api', loginRouter)
app.use('/server/api', databaseRouter)
app.use('/server/api', classRouter)
app.use('/server/api', experimentRouter)

// 开启服务器端口 端口号3000
app.listen(3000, () => {
    console.log('sql服务器api已开启,baseURL http://127.0.0.1，端口号3000');
})
