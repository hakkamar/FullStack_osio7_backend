const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
  blogi: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog' },
  comment: String
})

commentSchema.statics.format = function (comment) {
  return {
    id: comment._id,
    blogi: comment.blogi,
    comment: comment.comment
  }
}

const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment