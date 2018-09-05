//由于用户名的密码信息属于敏感信息，所以要加密保存
//加密需要用到核心模块crypto
const crypto = require('crypto')

//加密对象-->返回成功的数据
module.exports = function (password,KEY = 'hejiancheng hen li hai ') {
	const hmac = crypto.createHmac('sha256',KEY)
	//创建hmac加密方式。第一个值为加密方式，第二个值为签名的key值
	hmac.update(password)		//对密码进行加密
	const passwordHmac = hmac.digest('hex')		//返回加密后的16进制对象
	return passwordHmac
}