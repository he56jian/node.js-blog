// controd文件夹用于保存操作中间件的文件,当前user为操作用户行为的文件
// 操作数据库的话需要使用db对象的模型对象；
const {db} = require('../schemas/config')
//获取用户对象的schema
const userSchema = require('../schemas/user')

//获取加密的函数
const enCrypto = require('../encrypto')

// 通过db对象创建操作user表的模型对象
const User = db.model('users', userSchema)

//用户状态
exports.status = async (ctx) =>{

	//异步函数，要加await，不然不执行;//直接在render里导入文件就行
	await  ctx.render('index',{
		title:'node项目',
		// session:{
		// 	role:66,
		// }
	})
}

//处理登录事件
exports.login = async (ctx) => {
	//用户登录时，先要去数据库查看是否存在该用户名
	const user = ctx.request.body
	const username = user.username
	const password = user.password
	await new Promise((resolve,reject)=>{
		User.find({username},(err,data)=>{
			if(err){					//在查找数据库过程中出错
				console.log(err)
				reject(err)
			}
			//查找数据库，1、查找到，2、查找不到
			if(data.length !== 0){
				//因为data是一个数组，所以要加个[0]
				if(enCrypto(password) === data[0].password){
					resolve('登录成功')
				}

				resolve('密码错误')		//如果查找到了,说明数据库已经存在
			}else{
				resolve('用户不存在，')		//查找不到，说明数据库没存在;用户不存在
			}

		})
	})
		.then(async (res)=>{
			if(res){
				await ctx.render('isOk',{status:res})
			}else{
				await ctx.render('isOk',{status:res+'，请重试'})
			}
		})
		.catch(async ()=>{
			await ctx.render('isOk',{status:'登录失败，请重试'})
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