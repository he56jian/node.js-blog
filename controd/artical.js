//专门用于处理文章列表的中间件
const articalSchema = require('../schemas/artical')
const userSchema = require('../schemas/user')
const commentSchema = require('../schemas/comment')
const {db} = require('../schemas/config')			//导入用于处理字数据库的命令
//通过子数据库，创建用于执行子数据库中的表命令的模型对象
const Articel = db.model('articals', articalSchema)
const Comment = db.model('comments', commentSchema)
const User = db.model('users', userSchema)

exports.getList = async (ctx) => {
//在ctx.params.id里可以获取其动态地址的值
	let page = ctx.params.id || 1			//获取页数
	page--
	//获取查询到的最大数量
	const maxNum = await Articel.estimatedDocumentCount((err, data) => {
		err ? console.log(err) : data
	})

	//所以mongoose的查询的API都不会主动执行,要他主动执行，要传回调函数，或者then（因为mongoose都是promise对象），或者后面添加exec(回调函数)
	const artList = await Articel		//获取的对象是一个数组类型
		.find()					//查询所以表内容
		.sort('-created')					//排序,根据查找的created字段降序排序，不加-则为升序//给文章列表排序，在sort能有多种排序方式，涉及原子操作
		.skip(2 * page)							//跳过，跳过5条数据
		.limit(2)								//筛选，筛选5条信息；目前为止拿到文章列表的5条数据
		.populate({							//mongoose用于连表查询，其中path只要关联，有连表功能的字段就好了；查找到auther里面链接的表的Select中对应的属性
			path: 'auther',
			select: 'username _id avatar'
		})								//当前结果是，去articals表里查找排除前五项的五条数据，并且把它连接的表对应的username、_id、avatar取出来放到articel对象的auther属性中
		.then(data => data)					//成功了执行
		.catch(err => {
			console.log(err)
		})

	//异步函数，要加await，不然不执行;//直接在render里导入文件就可以了，它的返回值是一个promise对象；
	await ctx.render('index', {
		title: '主页',
		session: ctx.session,
		artList,
		maxNum,
	})
}
//进入文章发表页面,新建文章
exports.addPage = async (ctx) => {
	await ctx.render('./add-article', {title: '文章发表页面', session: ctx.session})
}

//发布文章
exports.add = async ctx => {
	if (ctx.session.isNew) {
		return ctx.body = {			//是哪个调用的就是哪个吗，还是全文通用？？？？？？ctx.body指的是上下文的对象；
			msg: "用户未登录",
			status: 0
		}
	}
	//获取post请求，用ctx.request.body
	const data = ctx.request.body
	data.commentNum = 0				//发布后设置默认值为0
	data.auther = ctx.session.uid
	//因为save方法返回的是promise对象，所以可以直接await，可以加个then；save回调监听和then监听也可以；不能两个都写，如果两个都写，会出现new Articel两次
	//而因为要返回数据，涉及到异步，如果异步没有完成则返回数据的话，会返回数据线执行，有可能发挥的数据不是想要的数据
	await new Promise((resolve, reject) => {
		new Articel(data).save((err, data) => {
			if (err) {
				return reject(err)
			}
			//更新用户的文章信息
			User.update({_id: data.auther}, {$inc: {articalNum: 1}}, err => {
				if (err) return console.log(err)
			})
			resolve(data)
		})
	})
		.then(data => {
			ctx.body = {
				msg: '发表成功',
				status: 1
			}
		})
		.catch(err => {
			ctx.body = {
				msg: '发表失败',
				status: 0
			}
		})
}

//文章详情页
exports.details = async ctx => {
	const _id = ctx.params.id			//获取动态ID，为文章的ID
	const article = await Articel.findById(_id).populate({
			path: 'auther',
			select: 'username'
		})
		.then(async data => {
			return data
		})
		.catch(async err => {
			console.log(err)
		})
	//查找跟评论相关的文章数据,find里放的是用户的ID，如果放的是article的ID，则要变为对象方式
	const comment = await Comment
		.find({article: _id})
		.sort('-created')			//根据时间倒序
		.populate('from', 'username avatar')		//获取关联的用户信息
		.then(async data => {
			return data
		})
		.catch(async err => console.log(err))
	await ctx.render('article', {
		title: '文章详情',
		session: ctx.session,
		article,
		comment,
	})

}

//获取当前用户的文章列表
exports.articalList = async ctx => {
	const _id = ctx.session.uid
	const data = await Articel.find({auther: _id}, (err, data) => {
		if (err) console.log(err)
	})
	ctx.body = {
		code: 0,
		count: data.length,
		data
	}
}

//删除文章
exports.del = async ctx => {
	const artId = ctx.params.id
	//这个_id为文章ID；
	//在用户数据库中删除
	//获取对应用户的文章，对应的文章ArticalNum-1
	// User.update({_id: ctx.session.uid}, {$inc: {articalNum: -1}}).then((...r)=>{
	// 	console.log(r)
	// })
	// Comment.find({article:artId},(err,data)=>{
	//
	//
	// })
	//删除文章ID对应的文章，
	// Articel.deleteOne({_id: artId}).exec(err => {
	// 	if (err) {
	// 		res = {
	// 			state: 0,
	// 			message: '删除文章失败'
	// 		}
	// 	} else {
	// 		res = {
	// 			state: 1,
	// 			message: '删除文章成功'
	// 		}
	// 	}
	// })


	// console.log(_id,ctx.session.uid)

	let res = {
		state:1,
		message:'c删除文章成功'
	}

	await Articel.findById(artId)
		.then(data=>{data.remove()})
		.catch(err=>{
			res={
				state:0,
				message:'删除文章失败'
			}
		})

	ctx.body = res
}



















