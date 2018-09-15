//创建一个项目，第一步，先要知道项目的需求，项目每个需求需要的功能，每个功能需要对应的哪些模块。
//koa模块：是一个框架，专门用于处理请求和响应数据的框架；
// 1、先要创建出koa实例，并让页面显示内容；
//模块导入机制，在导入之后，下次导入就直接从缓存中导入；
const Koa = require('koa')
const app = new Koa
const views = require('koa-views')				//因为要用pug模板引擎注册到koa上，需要koa-views模块中间件处理;他会自动识别pug模板引擎；
const {join} = require('path')					//因为在要使用路径相关的，所以要导入path核心模块
const static = require('koa-static')			//因为有用到css和js及图片的静态资源，所以要引入koa-static模块，专门处理静态资源的
const session = require('koa-session')			//因为http请求是无状态的，如果要保留用户的登录状态需要用到koa-session模块,在后端实现，类似前端cookie的东西；
const compress = require('koa-compress')
//配置session,需要过期时间，
app.keys = ['Sid']			//要用到session时，要加上当前值，要不然会报错
const CONFIG = {
	key: 'Sid',									//用于在后面查找
	maxAge: 36e5,							//过期时间
	autoCommit: true,							//是否自动提交
	overwrite: true,								//是否覆盖
	httpOnly: true,								//http是否不可见
	// signed:true,								//是否签名
	rolling: false								//是否在有新操作时刷新
}
app.use(session(CONFIG, app))

//压缩
app.use(compress({
	threshold:2048,
	flush:require('zlib').Z_SYNC_FLUSH
}))
// const logger = require('koa-logger')			//导入一个日志模块，便于查看日志
// app.use(logger())//日志文件，放在第一个中间件中好点

//在输入密码登录后，由于要传递submit到后台，后台要接受数据，就不能使用get方法，因为如果用的是get方法，会刷新页面，会导致数据传输失败；所以要用post请求，post请求的话就要用到koa-body来处理比较方便；
//在验证密码正确与否时，要和数据库传输，所以要创建一个专门用于存放数据库的文件，方便使用；并且数据库的操作需要koa-schema模块；
const body = require('koa-body')
app.use(body())									//配置body，用于获取post请求；
app.use(static(join(__dirname, 'public')))		//在注册路由之前，需要配置静态资源

//views中接收两个参数，第一个参数是文件夹地址，第二个参数为模板引擎的类型
//在views使用app.use注册时，就会在ctx里注册了一个render方法，用于渲染模板引擎，其参数只需要传递模板引擎就可以，其路径是相对于文件夹的路径的。
app.use(views(join(__dirname, 'views'), {
	extension: 'pug'
}))	//配置视图模板

const router = require('./routers/router')		//因为路由比较多，放到一个文件夹中比较好


//接收中间件，并自动处理，帮助中间件注册到实例中；参数为中间件，且要是异步函数
// app.use(async (ctx, next) => {
// 	//第一个参数ctx为一个上下文，第二个参数为把权限交给下一个中间件。
// })


//由于中间件绑定在router上，而router不具备监听端口的功能，想当于把中间件的事件注册到了对应路由对应方法的router上
//而要把router运用到koa上，需要把整个router当做中间件挂载到app.use上
//注册路由信息
app.use(router.routes())
	.use(router.allowedMethods())

app.listen(3002, () => {
	console.log('项目启动成功，监听在3002端口')
})

{
	//创建一个管理员用户
	//账号为admin/密码为admin
	const {db} = require('./schemas/config')
	const userSchema = require('./schemas/user')
	const enCrypto = require('./encrypto')
	const User = db.model('users', userSchema)
	User.find({username: 'admin'})
		.then(data => {
			if (data.length === 0) {			//如果没有设置管理员账号
				new User({
					username: 'admin',
					password: enCrypto('admin'),
					articalNum: 0,
					commentNum: 0,
					role: 666
				}).save()
					.then(data => {
						console.log('添加管理员信息成功，管理员用户信息：admin')
					})
					.catch(err => {
						console.log('错误')
					})
			} else {
				console.log('管理员账号：admin 密码：admin')
			}
		})
}