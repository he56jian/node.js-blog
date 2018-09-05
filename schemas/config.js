// 当前的文件用于链接数据库，并导出文件
//由于要用到数据库，所以要到入数据库模块
const mongoose = require('mongoose')
const db = mongoose.createConnection('mongodb://localhost:27017/user',{useNewUrlParser:true})	//创建或链接一个子数据库；用于存放用户数据；
// db对象，用于操作数据库的对象、操作数据库必须通过db.model才行

mongoose.Promise = global.Promise		//用原生es6代替原来的promise;
const Schema = mongoose.Schema

db.on('error',()=>{
	console.log('数据库链接失败')
})
db.on('open',()=>{
	console.log('数据库链接成功')
})


module.exports = {
	db,
	Schema
}