//存放文章列表的Schema对象
const {Schema} = require('./config')
const ObjectId = Schema.ObjectId

//因为在后续中，文章、评论，要用到对应用户的头像，作者名，所以要用唯一的标识。其中在schema就有一个objectId 的类型，标识唯一标识ID；
// 用于关联其他表。要写成对象形式，标识，当前值是什么类型，关联的那张表
const ArticalSchema = new Schema({
	title:String,
	tips:String,
	content: String,
	commentNum:Number,				//评论数量
	auther:{
		type:ObjectId,
		ref:'users'							//用于关联其他表，其值是在另一个表生成时的model函数的第一个参数
	}
}, {
	versionKey: false,
	timestamps:{
		createdAt:'created'
	}
})


//文章的钩子
ArticalSchema.post('remove',doc=>{
	const User = require('../models/user')
	const Comment = require('../models/comment')

	const {_id:artId,auther:autherId} = doc
	User.findByIdAndUpdate(autherId,{$inc:{articalNum:-1}}).exec()
	Comment.find({article:artId})
		.then(data=>{
			data.forEach(v=>v.remove())
		})
})


module.exports = ArticalSchema
