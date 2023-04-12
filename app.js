const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const expressLayouts = require('express-ejs-layouts');
const app = express();
const db=require('../MINIYOX/config/connection');
const session=require('express-session');
const nocache=require('nocache');
require('dotenv').config();

//Database connection
db.connect((err)=>{
  if(err){
    console.log("connection error");
  }else{
    console.log("database connected");
  }
})

const adminRouter = require('./routes/admin');
const usersRouter = require('./routes/users');



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(nocache());
app.use(cookieParser());
app.use(express.static('public'));
app.use(expressLayouts);
app.use(session({
  secret: 'my-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 18000000 } 
}));
app.use('/', usersRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
