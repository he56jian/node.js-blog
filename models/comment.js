const {db} = require('../schemas/config')

const CommentSchema = require('../schemas/comment')
const Comment = db.model('comments', CommentSchema)

module.exports = Comment