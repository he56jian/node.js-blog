//当前文件用于存放用户对象的schema对象
const {Schema} = require('./config')
const userSchema = new Schema({
	username:String,
	password:String
},{versionKey:false})

module.exports = userSchema		//在controd中处理数据