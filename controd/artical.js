//专门用于处理文章列表的中间件
const articalSchema = require('../schemas/artical')
const {db} = require('../schemas/config')			//导入用于处理字数据库的命令
//通过子数据库，创建用于执行子数据库中的表命令的模型对象
const Articel = db.model('articals', articalSchema)


//进入文章发表页面
exports.addPage = async (ctx) => {
	await ctx.render('./add-article', {title: '文章发表页面', session: ctx.session})
}

//发布文章
exports.add = async ctx => {
	if (ctx.session.isNew) {
		return ctx.body = {			//是哪个调用的就是哪个吗，还是全文通用？？？？？？
			msg: "用户未登录",
			status: 0
		}
	}

	//获取post请求，用ctx.request.body
	const data = ctx.request.body
	data.auther = ctx.session.username

	//因为save方法返回的是promise对象，所以可以直接await，可以加个then；save回调监听和then监听也可以；不能两个都写，如果两个都写，会出现new Articel两次
	//而因为要返回数据，涉及到异步，如果异步没有完成则返回数据的话，会返回数据线执行，有可能发挥的数据不是想要的数据
	await new Promise((resolve ,reject)=>{
		new Articel(data).save((err,data)=>{
			if(err){
				return reject(err)
			}
			resolve(data)
		})
	})
		.then(data=>{
			ctx.body={
				msg:'发表成功',
				status:1
			}
		})
		.catch(err=>{
			ctx.body={
				msg:'发表失败',
				status:0
			}
		})

}