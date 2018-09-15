const {Schema} = require('./config')
const ObjectId = Schema.ObjectId

const CommentSchema = new Schema({
	// 文章 表
	//用户数据 表
	//评论数据
	content: String,
	from: { 			//获取users里面的objectId
		type: ObjectId,
		ref: 'users'
	},
	article: {			//获取articles里面的objectId
		type: ObjectId,
		ref: 'articals'
	}
}, {
	versionKey: false,
	timestamps: {
		createdAt: 'created'
	}
})

//在删除事件前处理，next()把权限交给另一个
//设置comment的remove钩子
//能监听所有的评论的文档所触发的监听
CommentSchema.post('remove',(doc)=>{
	const User = require('../models/user')
	const Article = require('../models/article')

	const {from,article} = doc

	//文章对应的评论数-1	,,每次updata都会弹出警告，因为后续几个版本，有可能会移出，所有使用updataOne
	Article.updateOne({_id:article},{$inc:{commentNum:-1}}).exec()
	User.updateOne({_id:from},{$inc:{commentNum:-1}}).exec()


	//对应用户的评论数-1


})


module.exports = CommentSchema