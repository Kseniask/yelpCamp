var mongoose = require('mongoose')
var comSchema = new mongoose.Schema({
  text: String,
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String
  }
})
var Comment = mongoose.model('Comment', comSchema)
module.exports = Comment
