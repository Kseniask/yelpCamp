var express = require('express'),
  app = express(),
  bodyParse = require('body-parser'),
  mongoose = require('mongoose'),
  passport = require('passport'),
  LocalStrategy = require('passport-local'),
  Campground = require('./models/campground'),
  flash = require('connect-flash'),
  methodOverride = require('method-override'),
  Comment = require('./models/comment'),
  User = require('./models/user')
// SeedDB = require('./seeds')
mongoose.connect('mongodb://localhost/yelp-camp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

app.use(bodyParse.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'))
// SeedDB() seed DB
app.set('view engine', 'ejs')

//PASSPORT CONFIG
app.use(
  require('express-session')({
    secret: 'Rusty is cute',
    resave: false,
    saveUninitialized: false
  })
)
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())
//res.locals should be after passport initialization
app.use(function (req, res, next) {
  res.locals.currentUser = req.user
  //flash messages
  res.locals.error = req.flash('error')
  res.locals.success = req.flash('success')

  // console.log(req.user)
  next()
})
app.use(methodOverride('_method'))
app.get('/', (req, res) => {
  res.render('landing')
})

//=========
//CAMP ROUTES
//=========

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
app.get('/campgrounds/new', isLoggedIn, (req, res) => {
  res.render('campgrounds/new')
})

//create camp
app.post('/campgrounds', (req, res) => {
  var name = req.body.name
  var image = req.body.image
  var price = req.body.price
  var desc = req.body.description
  var author = {
    id: req.user._id,
    username: req.user.username
  }
  var newCamp = {
    name: name,
    price: price,
    image: image,
    description: desc,
    author: author
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
        console.log(fcamp.price)
        res.render('campgrounds/show', { campground: fcamp })
      }
    })
  // req.params.id
  // res.render('show')
})
//Edit camps
app.get('/campgrounds/:id/edit', checkOwnership, (req, res) => {
  Campground.findById(req.params.id, (err, fcamp) => {
    if (err) {
      req.flash('error', 'No camp found')
    }
    res.render('campgrounds/edit', { campground: fcamp })
  })
})
//Update camps
app.put('/campgrounds/:id', function (req, res) {
  //find the camp
  var data = {
    name: req.body.name,
    price: req.body.price,
    image: req.body.image,
    description: req.body.description
  }
  Campground.findByIdAndUpdate(req.params.id, data, (err, fcamp) => {
    if (err) {
      res.redirect('/campgrounds')
    } else {
      res.redirect('/campgrounds/' + req.params.id)
    }
  })
})

//Destroy

app.delete('/campgrounds/:id', checkOwnership, (req, res) => {
  //check if logged in(same as isLoggedin)
  // if (req.isAuthenticated()) {
  //   //does the user own a camp?
  Campground.findByIdAndRemove(req.params.id, (err, campground) => {
    //     if (err) {
    //       res.send('YOU ARE NOT ALLOWED TO DO SO')
    //     } else {
    //       //baceuse ===, == will not work _id is string, id - mongoose obj
    //       if (campground.author.id.equals(req.user._id))
    //         res.redirect('/campgrounds')
    //     }
    //   })
    // } else {
    //   res.redirect()
    res.redirect('/campgrounds')
  })
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
          req.flash('error', 'Something went wrong')
          console.log(err)
        } else {
          //add username and id to comment
          com.author.id = req.user._id
          com.author.username = req.user.username

          //save comment
          com.save()

          camp.comments.push(com)
          camp.save()
          req.flash('success', 'Successfully added comment')
          res.redirect('/campgrounds/' + req.params.id)
        }
      })
    }
  })
})

app.get(
  '/campgrounds/:id/comments/:comment_id/edit',
  checkCommentOwnership,
  (req, res) => {
    Comment.findById(req.params.comment_id, (err, foundComm) => {
      if (err) {
        req.flash('error', 'You need to be logged in to do that')
        res.redirect('back')
      } else {
        res.render('comments/edit', {
          campground_id: req.params.id,
          comment: foundComm
        })
      }
    })
  }
)

app.put('/campgrounds/:id/comments/:comment_id', (req, res) => {
  Comment.findByIdAndUpdate(
    req.params.comment_id,
    req.body.comment,
    (err, updateComm) => {
      if (err) {
        res.redirect('back')
      } else {
        res.redirect('/campgrounds/' + req.params.id)
      }
    }
  )
})

//comments destroy route
app.delete(
  '/campgrounds/:id/comments/:comment_id',
  checkCommentOwnership,
  (req, res) => {
    Comment.findByIdAndRemove(
      req.params.comment_id,
      { useFindAndModify: false },
      err => {
        if (err) {
          res.redirect('back')
        } else {
          req.flash('success', 'Comment deleted')
          res.redirect('/campgrounds/' + req.params.id)
        }
      }
    )
  }
)
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
        req.flash('error', err.message)
        return res.render('register')
      }
      passport.authenticate('local')(req, res, function () {
        req.flash('success', 'Welcome to YelpCamp, ' + user.username)
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
  req.flash('success', 'Logged you out!')
  res.redirect('/campgrounds')
})

//middleware

function isLoggedIn (req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  req.flash('error', 'You need to be logged in to do that')
  res.redirect('/login')
}

function checkOwnership (req, res, next) {
  if (req.isAuthenticated()) {
    Campground.findById(req.params.id, (err, fcamp) => {
      if (err) {
        res.redirect('back')
      }
      if (fcamp.author.id.equals(req.user._id)) {
        next()
      } else {
        res.redirect('back')
      }
    })
  } else {
    req.flash('error', 'You need to be logged in to do that')
    res.redirect('back')
  }
}
function checkCommentOwnership (req, res, next) {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, (err, fcomm) => {
      if (err) {
        req.flash('error', 'You need to be logged in to do that')
        res.redirect('back')
      }
      if (fcomm.author.id.equals(req.user._id)) {
        next()
      } else {
        req.flash('error', "You don't have permission to do that")
        res.redirect('back')
      }
    })
  } else {
    res.redirect('back')
  }
}

app.listen(3300, () => {
  console.log('YelpCamp server started')
})

//add manually

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
