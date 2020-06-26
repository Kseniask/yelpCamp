var express = require('express'),
  app = express(),
  bodyParse = require('body-parser'),
  mongoose = require('mongoose'),
  passport = require('passport'),
  LocalStrategy = require('passport-local'),
  Campground = require('./models/campground'),
  Comment = require('./models/comment'),
  User = require('./models/user'),
  SeedDB = require('./seeds')
mongoose.connect('mongodb://localhost/yelp-camp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

SeedDB()
app.use(bodyParse.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'))

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  res.render('landing')
})

// Campground.create(
//   {
//     name: 'Salmon Creek',
//     image:
//       'https://hipcamp-res.cloudinary.com/images/c_fill,f_auto,g_auto,h_504,q_60,w_770/v1445485302/campground-photos/cznqogta0xm6pynikxeo/salmon-creek-ranch-redwood-camp-bay-area-tent-people-lodging.jpg',
//     description:
//       'You can fish and yeat the gret soup with fresh salmon right there'
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

//PASSPORT CONFIG
app.use(
  require('express-session')({
    secret: 'Rusty is cute',
    resave: false,
    saveUninitialized: false
  })
)

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())
app.use(function (req, res, next) {
  res.locals.currentUser = req.user
  console.log(req.user)
  next()
})
//camps page

app.get('/campgrounds', (req, res) => {
  //get app camps from DB
  Campground.find({}, (err, camp) => {
    if (err) {
      console.log(err)
    } else {
      res.render('campgrounds/index', {
        campgrounds: camp,
        currentUser: req.user
      })
    }
  })

  // res.render('campgrounds', { campgrounds: campgrounds })
})

//add camp page
app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new')
})

//create camp
app.post('/campgrounds', (req, res) => {
  var name = req.body.name
  var image = req.body.image
  var desc = req.body.description
  var newCamp = {
    name: name,
    image: image,
    description: desc
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
//show

app.get('/campgrounds/:id', (req, res) => {
  // req.user - all info about current user
  //find campground with  provided id
  Campground.findById(req.params.id)
    .populate('comments')
    .exec((err, fcamp) => {
      if (err) {
        console.log(err)
      } else {
        res.render('campgrounds/show', { campground: fcamp })
      }
    })
  // req.params.id
  // res.render('show')
})

//=========
//COMMENT ROUTES
//=========
//is logged in is a middleware toc heck if logged in
app.get('/campgrounds/:id/comments/new', isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, camp) => {
    if (err) {
      console.log(err)
    } else {
      res.render('comments/new', { campground: camp })
    }
  })
})

app.post('/campgrounds/:id/comments', isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, camp) => {
    if (err) {
      res.redirect('/campgrounds')
    } else {
      Comment.create(req.body.comment, (err, com) => {
        if (err) {
          console.log(err)
        } else {
          camp.comments.push(com)
          camp.save()
          res.redirect('/campgrounds/' + camp._id)
        }
      })
    }
  })
})
//======
//AUTH ROUTES
//======

app.get('/register', (req, res) => {
  res.render('register')
})
app.post('/register', (req, res) => {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    (err, user) => {
      if (err) {
        console.log(err)
        return res.render('register')
      }
      passport.authenticate('local')(req, res, function () {
        res.redirect('/campgrounds')
      })
    }
  )
})
//====
//LOGIN
//====

//show login page
app.get('/login', (req, res) => {
  res.render('login')
})

//hande login logic
app.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/campgrounds',
    failureRedirect: '/login'
  }),
  (req, res) => {}
)

//logout

app.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/campgrounds')
})

function isLoggedIn (req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/login')
}
app.listen(3300, () => {
  console.log('YelpCamp server started')
})
