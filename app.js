const koa = require('koa');
const mysql= require('mysql');
const json = require('koa-json');
const koaRouter = require('koa-router');
const path = require('path');
const render = require('koa-ejs');
const bodyParser = require('koa-bodyparser');

const app = new koa();
const router = new koaRouter();

//数据连接池
const pool = mysql.createPool({
    host : 'localhost',
    user : 'root',
    password : '15186478704scs?',
    database : 'xinwen'
});
//连接数据库
var query = function(sql, values){
    return new Promise((resolve, reject) => {
        pool.getConnection(function(err, connection){
            if(err){
                reject(err);
            } else {
                connection.query(sql, values, (err, rows) => {
                    if(err){
                        reject(err);
                    } else {
                        resolve( rows );
                    }
                    connection.release();
                });
            }
        });
    });
}
//查询数据
async function getData(VALUES){
    var sql = 'SELECT * FROM user WHERE userName = ?, userPassword = ?';
    var data = await query(sql,VALUES);
    console.log(data);
}
//加入数据
async function addData(VALUES){
    var sql = `INSERT INTO user
    (userName, userPassword)
    VALUES
    (?, ?)
    `;
    var data = await query(sql, VALUES);
    console.log(data);
}
//更新数据
async function updataData(VALUES){
    var sql = `UPDATE user SET userPassword = ? WHERE userName = ?`;
    var data = await query(sql, VALUES);
    console.log(data);
}

app.use(json());
app.use(bodyParser());

//配置模板引擎
render(app, {
    root : path.join(__dirname, 'views'),
    layout : 'layout',
    viewExt : 'html',
    cache : false,
    debug : false
});

//路由跳转
router.get('/', index);
router.get('/zhuche',zhuChe);
router.get('/xinwen',xinWen);

//函数声明
async function index(ctx){
    await ctx.render('index',{
        title : "新闻大事件"
    });
}
async function zhuChe(ctx){
    await ctx.render('zhuche',{
        title : "注册账户 "
    });
}
async function xinWen(ctx){
    await ctx.render('xinwen');
}


//添加路由方法
router.post('/zhuche', zhuche);
async function zhuche(ctx){
    const body = ctx.request.body;
    var userName = body.userName;
    var userPassword = body.userPassword;
    var userPassword2 = body.userPassword2;
    if(userPassword===userPassword2){
        addData([userName, userPassword]);
        ctx.redirect('/');
    } else {
        ctx.redirect('/zhuche');
    }
}
router.post('/index',Index);
async function Index(ctx){
    const body = ctx.request.body;
    var userName = body.userName;
    var userPassword = body.userPassword;
    if(getData([userName, userPassword])){
        ctx.redirect('/xinwen');
    }
}

//配置路由
app.use(router.routes()).use(router.allowedMethods());
app.listen(3000, () => {console.log('serve.start...')});