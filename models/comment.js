var mongoose = require('mongoose')
var comSchema = new mongoose.Schema({
  text: String,
  author: String
})
var Comment = mongoose.model('Comment', comSchema)
module.exports = Comment
