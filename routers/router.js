//因为要用到路由，所以可以加koa-router用来管理路由的模块中间件；
const Router = require('koa-router')

//拿到操作user表的逻辑对象
const user = require('../controd/user')			//用户的处理函数中间件
const artical = require('../controd/artical')		//文章的处理函数中间件
const router = new Router

//设置主页,都是在/根目录下，一定只能通过get方式访问
router.get('/',user.keeplog,async (ctx) => {
	//异步函数，要加await，不然不执行;//直接在render里导入文件就行
	await  ctx.render('index', {
		title: 'node项目',
		session:ctx.session
	})
})

//主要用来处理用户登录和用户注册。因为页面类似，操作类似。
//使用动态路由，减少代码量；在url中：id,然后在对应的回调函数中的ctx.params中能拿到，其动态路由的值
//其第一个参数的地址，能用正则来匹配,以/user开头/login或者/res结尾
router.get(/^\/user\/(?=login|reg)/,async(ctx) =>{
	const show = /reg$/.test(ctx.path)
	//如果show为真，则为注册页面，反之为登录页面;并且在模板引擎中，show用来判断注册和登录页面的显示隐藏
	await ctx.render('register',{show:show})
})

// 由于登录和注册都需要用到数据，并且要不刷新页面，防止出现数据丢失，所以用post请求
router.post('/user/login',user.login)	//处理登录事件

router.post('/user/reg',user.reg)		//处理注册事件；输入账号后，存入数据库；

//用户退出
router.get('/user/logout',user.logout)

//新建文章,不过在进入新建文章之前，先要判断是否有权限，使用user.keeplog
router.get('/article',user.keeplog,artical.addPage)

//发布文章
router.post('/article',user.keeplog,artical.add)

module.exports = router