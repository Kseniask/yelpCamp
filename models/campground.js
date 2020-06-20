mongoose = require('mongoose')
//create Schema
var campSchema = new mongoose.Schema({
  name: String,
  image: String,
  description: String,
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ]
})
var Campground = mongoose.model('Campground', campSchema)
module.exports = Campground
