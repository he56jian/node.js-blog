

const fs = require('fs')
const {join} = require('path')




exports.manage = async ctx => {
	//判断有没有登录
	if (ctx.session.isNew) {
		//没有登录
		ctx.status = 404
		await ctx.render('404', {title: '404'})
	}
	//获取其动态id
	const _id = ctx.params.id
	const arr = fs.readdirSync(join(__dirname, '../views/admin'))	//文件名字的字符串,因为文件是在本地，所以用同步
	let flag = false
	arr.forEach(v => {
		const name = v.replace(/^(admin\-)|(\.pug)$/g, '')
		if (name === _id) {
			flag = true
		}
	})

	if (flag) {
		await ctx.render('./admin/admin-' + _id, {
			role: ctx.session.role
		})
	} else {
		ctx.status = 404
		await
			ctx.render('404', {title: '404'})
	}
}