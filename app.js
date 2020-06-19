var express = require('express'),
  app = express(),
  bodyParse = require('body-parser'),
  mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/yelp-camp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
app.use(bodyParse.urlencoded({ extended: true }))
app.set('view engine', 'ejs')
app.get('/', (req, res) => {
  res.render('landing')
})
//create Schema
var campSchema = new mongoose.Schema({
  name: String,
  image: String
})
var Campground = mongoose.model('Campground', campSchema)

// Campground.create(
//   {
//     name: 'Salmon Creek',
//     image:
//       'https://hipcamp-res.cloudinary.com/images/c_fill,f_auto,g_auto,h_504,q_60,w_770/v1445485302/campground-photos/cznqogta0xm6pynikxeo/salmon-creek-ranch-redwood-camp-bay-area-tent-people-lodging.jpg'
//   },
//   (err, camp) => {
//     if (err) {
//       console.log(err)
//     } else {
//       console.log('Newly created camp: ' + camp)
//     }
//   }
// )

// var campgrounds = [
//   {
//     name: 'Granite Hill',
//     image:
//       'https://swoop-patagonia.imgix.net/SWO_4_TOM_ALL_Paine_Grande_Campsite_HEADER_.JPG?auto=format,enhance,compress&fit=crop&w=1200&h=0&q=30'
//   },
//   {
//     name: "Mountain Goat's Residence",
//     image:
//       'https://landwithoutlimits.com/resources/uploads/2019/10/CCCTMA-Images-Camping-CCC-Brad-Kasselman-v2-2048x1152.jpg'
//   },
//   {
//     name: 'Salmon Creek',
//     image:
//       'https://hipcamp-res.cloudinary.com/images/c_fill,f_auto,g_auto,h_504,q_60,w_770/v1445485302/campground-photos/cznqogta0xm6pynikxeo/salmon-creek-ranch-redwood-camp-bay-area-tent-people-lodging.jpg'
//   },
//   {
//     name: 'Granite Hill',
//     image:
//       'https://swoop-patagonia.imgix.net/SWO_4_TOM_ALL_Paine_Grande_Campsite_HEADER_.JPG?auto=format,enhance,compress&fit=crop&w=1200&h=0&q=30'
//   },
//   {
//     name: "Mountain Goat's Residence",
//     image:
//       'https://landwithoutlimits.com/resources/uploads/2019/10/CCCTMA-Images-Camping-CCC-Brad-Kasselman-v2-2048x1152.jpg'
//   }
// ]
//camps page
app.get('/campgrounds', (req, res) => {
  //get app camps from DB
  Campground.find({}, (err, camp) => {
    if (err) {
      console.log(err)
    } else {
      res.render('campgrounds', { campgrounds: camp })
    }
  })

  // res.render('campgrounds', { campgrounds: campgrounds })
})

//add camp page
app.get('/campgrounds/new', (req, res) => {
  res.render('form')
})

//create camp
app.post('/campgrounds', (req, res) => {
  var name = req.body.name
  var image = req.body.image
  var newCamp = {
    name: name,
    image: image
  }
  //create a new campground
  Campground.create(newCamp, (err, camp) => {
    if (err) {
      console.log('ERROR')
    } else {
      console.log('added ' + camp)
      res.redirect('/campgrounds')
    }
  })
})

app.listen(3300, () => {
  console.log('YelpCamp server started')
})
