const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

const User = require('./models/User');
const Inst = require('./models/Institute');
// const user = mongoose.model("User");
// const inst = mongoose.model("Inst");


const app = express();

//------------ Passport Configuration ------------//
require('./config/passport')(passport);

//------------ DB Configuration ------------//
const db = require('./config/key').MongoURI;

//------------ Mongo Connection ------------//
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(() => console.log("Successfully connected to MongoDB"))
    .catch(err => console.log(err));

//------------ EJS Configuration ------------//
app.use(expressLayouts);
app.use("/assets", express.static('./assets'));
app.set('view engine', 'ejs');

const MongoStore = require('connect-mongo');

// app.use(
// 	session({
// 		secret: 'I love memes',
// 		resave: true,
// 		saveUninitialized: true,
// 		store: MongoStore.create({ mongoUrl: db }),
// 		autoRemove: 'native',
// 		unset: 'destroy',
// 	})
// );

//------------ Bodyparser Configuration ------------//
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

//------------ Express session Configuration ------------//
app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
);

//------------ Passport Middlewares ------------//
app.use(passport.initialize());
app.use(passport.session());

//------------ Connecting flash ------------//
app.use(flash());

//------------ Global variables ------------//
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});



app.post('/addInsti', async (req, res, next) => {
    try{
        console.log(req.body);
        const {name, adminId, inst } = req.body
        
        console.log({name, adminId, inst});
        const institute = new Inst({
            name: name,
            admin : adminId,
            inst : inst
        })
    
        await institute.save();
    
        res.json({
            message: 'Saved Sucessfully'
        })
    }
    catch(err) {
        res.status(500).json({
            message: err
        })
    }

})



//------------ Routes ------------//
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));

app.use((req , res)=>{    
    res.render('error_404')
})

const PORT = process.env.PORT || 3006;

app.listen(PORT, console.log(`Server running on PORT ${PORT}`));





//add and remove teacher and students
//false admin (removing admins as well) - super admin
// results page
// 

