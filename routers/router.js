//因为要用到路由，所以可以加koa-router用来管理路由的模块中间件；
const Router = require('koa-router')

//拿到操作user表的逻辑对象
const user = require('../controd/user')			//用户的处理函数中间件
const artical = require('../controd/artical')		//文章的处理函数中间件
const comment = require('../controd/comment')		//处理文章评论的中间件
const admin = require('../controd/admin')		//处理文章评论的中间件
const upload = require('../upload')

const router = new Router


router.get('/', user.keeplog, artical.getList)			//设置主页,都是在/根目录下，一定只能通过get方式访问
router.get('/page/:id', artical.getList)				//文章列表分页；前面id写多少，就按照对应方式查找；当前是否会改变根目录情况

//主要用来处理用户登录和用户注册。因为页面类似，操作类似。
//使用动态路由，减少代码量；在url中：id,然后在对应的回调函数中的ctx.params中能拿到，其动态路由的值
//其第一个参数的地址，能用正则来匹配,以/user开头/login或者/res结尾
router.get(/^\/user\/(?=login|reg)/, async (ctx) => {
	const show = /reg$/.test(ctx.path)
	//如果show为真，则为注册页面，反之为登录页面;并且在模板引擎中，show用来判断注册和登录页面的显示隐藏
	await ctx.render('register', {show: show})
})
//不同路由响应不同请求
// 由于登录和注册都需要用到数据，并且要不刷新页面，防止出现数据丢失，所以用post请求
router.post('/user/login', user.login)	//处理登录事件 	路由

router.post('/user/reg', user.reg)			//处理注册事件；输入账号后，存入数据库；路由

router.get('/user/logout', user.logout)		//用户退出 路由

router.get('/article', user.keeplog, artical.addPage)		//新建文章,不过在进入新建文章之前，先要判断是否有权限，使用user.keeplog

router.post('/article', user.keeplog, artical.add)		//发布文章

router.get('/article/:id', user.keeplog, artical.details) //查看文章详情

router.post('/comment', user.keeplog, comment.addComment)//添加评论

router.get('/admin/:id', user.keeplog, admin.manage)		//用户管理路由

router.post('/upload', user.keeplog, upload.single('file'), user.upload)//上传头像路由

router.get('/user/comments',user.keeplog,comment.comList)		//获取评论列表路由
router.get('/user/articles',user.keeplog,artical.articalList)	//获取文章列表路由

router.del('/comment/:id',user.keeplog,comment.del)		//删除评论路由，在删除界面时，会发起delete的请求，del为简写
router.del('/article/:id',user.keeplog,artical.del)		//删除评论路由，在删除界面时，会发起delete的请求，del为简写

//

//在访问一个不存在的页面时，返回404
router.get('*', async ctx => {
	ctx.status = 404
	await ctx.render('404', {
		title: '404'
	})
})


module.exports = router