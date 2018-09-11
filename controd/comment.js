// 添加评论，需要用到数据库；
const {db} = require('../schemas/config')
const ArticleSchema = require('../schemas/artical')
const UsersSchema = require('../schemas/user')
const CommentSchema = require('../schemas/comment')

const article = db.model('articals',ArticleSchema)
const user = db.model('users',UsersSchema)
const Comment = db.model('comments',CommentSchema)




//添加评论的中间件
exports.addComment = async ctx => {
	let massage = {
		status:0,
		msg:'用户未登录'
	}
	if(ctx.session.isNew){			//如果没有登录的情况
		return ctx.body = massage				//这个指向的是哪个			指向的是弹窗？？？？
	}
	const data = ctx.request.body		//获取post请求过来的数据
	//需要获取当前登录的ID
	data.from = ctx.session.uid
	const comment = new Comment(data)
	await comment.save()
		.then(data =>{
			// 把数据网数据量中添加成功，更新成功
			massage={
				status:1,
				msg:'评论成功'
			}
			// 更新当前文章的评论计数器
			article.update({_id:data.article},{$inc:{commentNum:1}},err=>{
				if(err) return console.log(err)
				console.log('计数器发表成功')
			})
		})
		.catch(err=>{
			 massage = {
				status:0,
				msg:err
			}
		})

	ctx.body = massage

}