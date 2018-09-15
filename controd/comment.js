// 添加评论，需要用到数据库；
const Comment = require('../models/comment')
const user = require('../models/user')
const article = require('../models/article')


//添加评论的中间件
exports.addComment = async ctx => {
	let massage = {
		status: 0,
		msg: '用户未登录'
	}
	if (ctx.session.isNew) {			//如果没有登录的情况
		return ctx.body = massage				//这个指向的是哪个			指向的是弹窗？？？？
	}
	const data = ctx.request.body		//获取post请求过来的数据
	//需要获取当前登录的ID
	data.from = ctx.session.uid
	const comment = new Comment(data)
	await comment.save()
		.then(data => {
			// 把数据网数据量中添加成功，更新成功
			massage = {
				status: 1,
				msg: '评论成功'
			}
			// 更新当前文章的评论计数器
			article.update({_id: data.article}, {$inc: {commentNum: 1}}, err => {
				if (err) return console.log(err)
				console.log('计数器发表成功')
			})
			user.update({_id: data.from}, {$inc: {commentNum: 1}}, err => {
				if (err) return console.log(err)
				console.log('用户评论计数器发表成功')
			})
		})
		.catch(err => {
			massage = {
				status: 0,
				msg: err
			}
		})
	ctx.body = massage
}


//获取评论数据
exports.comList = async ctx => {
	const _id = ctx.session.uid			//获取登录的ID
	//根据登录账户获取其评论数据
	const data = await Comment.find({from: _id}).populate('article', 'title')
	ctx.body = {
		code: 0,
		count: data.length,
		data
	}
}

//删除评论
exports.del = async ctx => {
	const commentId = ctx.params.id
	// //因为在delete中有传了一个数据过来。其和post一样的方式，所以可以在request中获取
	// // const articalId = ctx.request.body.articleId
	// // //因为还要删除用户里面的评论数，所以还要获取用户ID
	// // const userId = ctx.session.uid
	// let articalId,userId;
	// //删除评论
	// let isOk = true
	// await Comment.findById(commentId,(err,data)=>{
	// 	if(err){
	// 		isOk = false
	// 	}else{
	// 		articalId = data.article
	// 		userId = data.from
	// 		isOk=true
	// 	}
	// })
	// // await主要目的为得到返回结果
	// //让文章的计数器减1
	// await article.update({_id:articalId},{$inc:{commentNum:-1}})
	// //删除用户的评论计数器
	// await user.update({_id:userId},{$inc:{commentNum:-1}})
	// await Comment.deleteOne({_id:commentId})
	// if(isOk){
	// 	   ctx.body = {
	// 	   	state:1,
	// 		   message:'删除成功'
	// 	   }
	// }
	let res = {
		state: 1,
		message: '成功'
	}

	//加个钩子，钩子只能用在原型上触发
	await Comment.findById(commentId).then(data => {
		data.remove()//会把数据删除，同时触发钩子
	}).catch(err => {
		res = {
			state: 0,
			message: err
		}
	})
	ctx.body = res
}








