//存放文章列表的Schema对象
const {Schema} = require('./config')

const ArticalSchema = new Schema({
	tigs: String,
	title: String,
	content: String,
	auther: String
}, {
	versionKey: false,
	timestamps:{
		createdAt:'created'
	}
})

module.exports = ArticalSchema
