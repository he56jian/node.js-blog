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


module.exports = CommentSchema