const { Pool } = require('pg');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const ejs = require('ejs');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
  secret: "Secret_key",
  resave: false, 
  saveUninitialized: false
}));

const authRoutes = require('./routes/auth')
app.use('/auth', authRoutes);

const postRoutes = require('./routes/post')
app.use('/post', postRoutes)

const adminRoutes = require('./routes/admin')
app.use('/admin', adminRoutes)

app.get('/', (req, res) => {
  res.redirect('/auth/sign-in');
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
