//当前文件用于存放用户对象的schema对象
const {Schema} = require('./config')
const userSchema = new Schema({
	username:String,
	password:String,
	avatar:{
		type:String,
		default:'/avatar/default.jpg'
		//如果未输入，则默认为当前值	，./和/的区别,./中根目录为运用的当前目录，/根目录为相对文件夹的位置（不会根据调用而改变）
	},
	articalNum:Number,					//用户发表的文章数量
	commentNum:Number,                   //用户发表的评论数量
	role:{       						//用户的权限，默认为1
		type:Number,
		default:1
	}
},{versionKey:false})

module.exports = userSchema		//在controd中处理数据