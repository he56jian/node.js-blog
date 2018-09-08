// controd文件夹用于保存操作中间件的文件,当前user为操作用户行为的文件
// 操作数据库的话需要使用db对象的模型对象；
const {db} = require('../schemas/config')
//获取用户对象的schema
const userSchema = require('../schemas/user')

//获取加密的函数
const enCrypto = require('../encrypto')

// 通过db对象创建操作user表的模型对象
const User = db.model('users', userSchema)

//处理登录状态保持用户状态，判断，是否有权限添加,判断当前是否为登录状态；
exports.keeplog = async (ctx, next) => {
	// ctx.session.isNew用于判断session的值是否为一个新的值
	if (ctx.session.isNew) {			//session没有值的时候，
		if (ctx.cookies.get('username')) {			//如果cookies里面有值，则赋值给session
			ctx.session = {
				username: ctx.cookies.get('username'),
				uid: ctx.cookies.get('uid')
			}
		}
	}
	await next()

}

//处理登录事件
exports.login = async (ctx) => {
	//获取前端发过来的账号密码
	const user = ctx.request.body
	const username = user.username
	const password = user.password

	await new Promise((resolve, reject) => {
		User.find({username}, (err, data) => {	//用户登录时，先要去数据库查看是否存在该用户名
			if (err) {					//在查找数据库过程中出错
				reject('')
			}
			//查找数据库，1、查找到，2、查找不到
			if (data.length === 0) {
				return reject('用户不存在')		//查找不到，说明数据库没存在;用户不存在
			}
			//因为data是一个数组，所以要加个[0]
			if (enCrypto(password) !== data[0].password) {
				return reject('密码错误')
			}		//如果查找到了,说明数据库已经存在
			resolve(data)
		})
	})
		.then(async (data) => {
			//登录成功；把登录的结果放入cookie;使用方法set,第一个参数传入键、第二个参数传入值，第三个参数传入配置的信息；
			ctx.cookies.set('username', username, {
				domain: 'localhost',			//作用的页面
				path: '/',					//作用的路径
				maxAge: 36e5,
				httpOnly: false,			//不给前端用
				overwrite: false,
				// signed: true
			})
			ctx.cookies.set('uid', data[0]._id, {
				domain: 'localhost',			//作用的页面
				path: '/',					//作用的路径
				maxAge: 36e5,
				httpOnly: true,
				overwrite: false,
				// signed: true
			})

			// //传入后台状态session
			ctx.session = {
				username,
				uid: data[0]._id,
				avatar:data[0].avatar
			}
			await ctx.render('isOk', {status: '登录成功'})
		})
		.catch(async (res) => {
			await ctx.render('isOk', {status: res || '登录失败'})
		})
}

//处理注册事件
exports.reg = async (ctx) => {
	//用户注册时，user指向post发过来的账号密码，
	const user = ctx.request.body
	const username = user.username		//分别获取账号密码；
	const password = user.password
	//注册时应该要做什么？
	//1、去数据库user先查询当前发过来的username是否存在
	// 因为数据库的操作是异步的，所以要用awai,然而await后面只能跟上promise，所以new
	await new Promise((resolve, reject) => {
		// 去users数据库查询,其find的参数1位需要比对的字段；第二个参数为回调函数
		User.find({username: username}, (err, data) => {
			if (err) return reject(err)  //如果err有值，则说明出错了
			//查询数据库没出错；但是有两种情况，1、数据库有username，2、数据库中没有username
			if (data.length !== 0) {		//用户名已存在
				return resolve('')
			}
			//数据库中没有当前用户名,保存到数据库，密码要先加密
			const _user = new User({
				username,
				password: enCrypto(password)
			})
			//保存到数据库
			_user.save((err, data) => {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			})

		})
	})
		.then(async data => {
			if (data) {
				//注册成功
				//因为render也是读取文件的行为，所以也是异步的，所以要加上await
				await ctx.render('isOk', {status: '注册成功'})
			} else {
				//用户已存在
				await ctx.render('isOk', {status: '用户名已存在'})
			}
		})
		.catch(async (err) => {
			// 登录失败，跳转到isok.pug
			await ctx.render('./isOk', {status: '登录失败'})
		})
}

//用户退出中间件
exports.logout = async (ctx) => {
	ctx.session = null;
	ctx.cookies.set('username', null, {
		maxAge: 0
	})
	ctx.cookies.set('uid', null, {
		maxAge: 0
	})
	//重定向到根目录		//前端重定向到根 location.href = '/'
	ctx.redirect('/')
	// await ctx.render('isOk',{status:'退出'})
}






