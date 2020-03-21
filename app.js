//引入express框架
const express = require('express');
// path模块
const path = require('path');
// 解析post
const bodyParser = require('body-parser');
// 解决跨域
const cors = require('cors');


// cookie、session
const cookieParser = require('cookie-parser');
const session = require('express-session');

// 用户路由注册
const userRouter = require('./routes/UserRouter');
const teacherRouter = require('./routes/TeacherRouter');
const studentRouter = require('./routes/StudentRouter');
const testRouter = require('./routes/TestRouter');

//实例化
const app = express();

// 解析格式
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

// 跨域设置
app.use(cors());

// 设置session
app.use(session({
    secret: 'zxlkcjad', //私钥
    cookie: {
        maxAge: 60 * 1000 * 60 * 24
    }, //设置有效时间 有效时间一天
    resave: true, //默认保存
    saveUninitialized: false, //不重复初始化
}));

//设置ejs为视图模板引擎
app.set('views', './views');
app.set('view engine', 'ejs');

//静态文件存放目录
app.use('/static', express.static('public'));

// 登录页渲染
app.get('/', (req, res, next) => {
    res.render('index')
});

// 登录页渲染
app.get('/root', (req, res, next) => {
    res.render('root')
});

// 路由使用
app.use('/user', userRouter);
app.use('/user', studentRouter);
app.use('/user', teacherRouter);
app.use('/test', testRouter);




// 转发注册
app.get('/studenthome', (req, res, next) => {
    if (req.session.login == true) {
        res.render('studenthome', {
            id: req.session.user.id,
            name: req.session.user.name,
            class_id: req.session.user.class_id,
            teacher_id: req.session.user.teacher_id
        });
    } else {
        res.render('index');
    }
})

app.get('/teacherhome', (req, res, next) => {
    // console.log(req.session);
    if (req.session.login == true) {
        res.render('teacherhome', {
            id: req.session.user.id,
            name: req.session.user.name
        });
    } else {
        res.render('index');
    }
})

app.get('/create', (req, res, next) => {
    if (req.session.login == true) {
        res.render('create', {
            id: req.session.user.id,
            name: req.session.user.name
        });
    } else {
        res.render('index');
    }
})

app.get('/teacher/table', (req, res, next) => {
    if (req.session.login == true) {
        res.render('mytable', {
            id: req.session.user.id
        });
    } else {
        res.render('index');
    }
})

app.get('/teacher/class', (req, res, next) => {
    if (req.session.login == true) {
        res.render('classManager', {
            id: req.session.user.id
        });
    } else {
        res.render('index');
    }
})



app.get('/student/mytest', (req, res) => {
    if (req.session.login != true) {
        res.render("1.ejs");
        return;
    }
    let {
        id,
        teacher_id,
        testname
    } = req.query;
    if (id != req.session.user.id || teacher_id != req.session.user.teacher_id) {
        return res.render("1.ejs");
    }
    res.render('mytest', {
        id,
        testname,
        teacher_id
    });
})




app.get('/student/mygrade', (req, res) => {
    if (req.session.login != true) {
        res.render("1.ejs");
        return;
    }
    let {
        id,
        teacher_id,
        testname
    } = req.query;
    if (id != req.session.user.id || teacher_id != req.session.user.teacher_id) {
        return res.render("1.ejs");
    }
    res.render('mygrade', {
        id,
        testname,
        teacher_id
    });
})


app.get('/help', (req, res) => {
    if (req.session.login != true) {
        res.render("1.ejs");
        return;
    }
    res.render('help');
})

app.get('/changepwd', (req, res) => {
    if (req.session.login != true) {
        res.render("1.ejs");
        return;
    }
    res.render('changepwd');
})





app.get('/user/student/test', (req, res) => {

    if (req.session.login != true) {
        res.render("1.ejs");
        return;
    }

    let {
        id,
        teacherid,
        testname
    } = req.query;
    if (id != req.session.user.id || teacherid != req.session.user.teacher_id) {
        return res.render("1.ejs");
    }
    res.render('test', {
        id,
        testname,
        teacherid
    });
})




// 开启服务器端口
app.listen(3000, () => {
    console.log('server start');
})