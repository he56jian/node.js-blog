const {db} = require('../schemas/config')


const ArticleSchema = require('../schemas/artical')
const article = db.model('articals', ArticleSchema)

module.exports = article