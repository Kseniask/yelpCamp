//to have same info on every start (Optional)
var mongoose = require('mongoose')
var Campground = require('./models/campground'),
  Comment = require('./models/comment')

var data = [
  {
    name: 'Granite Hill',
    image:
      'https://swoop-patagonia.imgix.net/SWO_4_TOM_ALL_Paine_Grande_Campsite_HEADER_.JPG?auto=format,enhance,compress&fit=crop&w=1200&h=0&q=30',
    description:
      'This is a huge granitte hill. No shower, no water, but the view is stunning'
  },
  {
    name: 'Salmon Creek',
    image:
      'https://hipcamp-res.cloudinary.com/images/c_fill,f_auto,g_auto,h_504,q_60,w_770/v1445485302/campground-photos/cznqogta0xm6pynikxeo/salmon-creek-ranch-redwood-camp-bay-area-tent-people-lodging.jpg',
    description:
      'You can fish and yeat the gret soup with fresh salmon right there'
  },
  {
    name: 'Star Camp',
    image:
      'https://blog-assets.thedyrt.com/uploads/2018/09/shutterstock_1277196250-compressor-2000x1120.jpg',
    description:
      'You can see amazing stars out of there. The very perfect place to have some romantic'
  }
]

function SeedDB () {
  Campground.deleteMany({}, err => {
    if (err) {
      console.log(err)
    } else {
      console.log('Remover Camps')
      data.forEach(seed => {
        Campground.create(seed, (err, campground) => {
          if (err) {
            console.log(err)
          } else {
            console.log('added camp')
            //create comment
            Comment.create(
              {
                text: ' This place is great. But lacks internet',
                author: 'Homer'
              },
              (err, comment) => {
                if (err) {
                  console.log(comment)
                } else {
                  campground.comments.push(comment)
                  campground.save()
                  console.log('Created comment')
                }
              }
            )
          }
        })
      })
    }
  })
}
module.exports = SeedDB
