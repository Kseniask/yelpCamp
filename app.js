var express = require('express')
var app = express(),
  bodyParse = require('body-parser')
app.use(bodyParse.urlencoded({ extended: true }))
app.set('view engine', 'ejs')
app.get('/', (req, res) => {
  res.render('landing')
})
var campgrounds = [
  {
    name: 'Salmon Creek',
    image:
      'https://hipcamp-res.cloudinary.com/images/c_fill,f_auto,g_auto,h_504,q_60,w_770/v1445485302/campground-photos/cznqogta0xm6pynikxeo/salmon-creek-ranch-redwood-camp-bay-area-tent-people-lodging.jpg'
  },
  {
    name: 'Granite Hill',
    image:
      'https://swoop-patagonia.imgix.net/SWO_4_TOM_ALL_Paine_Grande_Campsite_HEADER_.JPG?auto=format,enhance,compress&fit=crop&w=1200&h=0&q=30'
  },
  {
    name: "Mountain Goat's Residence",
    image:
      'https://landwithoutlimits.com/resources/uploads/2019/10/CCCTMA-Images-Camping-CCC-Brad-Kasselman-v2-2048x1152.jpg'
  }
]

app.get('/campgrounds', (req, res) => {
  res.render('campgrounds', { campgrounds: campgrounds })
})
app.get('/campgrounds/new', (req, res) => {
  res.render('form')
})
app.post('/campgrounds', (req, res) => {
  var name = req.body.name
  var image = req.body.image
  var newCamp = {
    name: name,
    image: image
  }
  campgrounds.push(newCamp)
  res.redirect('/campgrounds')
})

app.listen(3300, () => {
  console.log('YelpCamp server started')
})
