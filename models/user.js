const {db} = require('../schemas/config')


const UsersSchema = require('../schemas/user')
const user = db.model('users', UsersSchema)

module.exports = user