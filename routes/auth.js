const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const session = require('express-session');
const { loginRequired } = require('../middleware/middleware');
const pool = require('../db/db')

router.get('/sign-in', (req, res) =>{
    if(req.session.user){
      res.redirect('/dashboard');
      return;
    }
    res.render('login')
});

router.post('/sign-in', async (req, res) => {
    const { username, password } = req.body;
    try {
      const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
      if (result.rows.length > 0) {
        const storedHashedPassword = result.rows[0].password;
        const check = await bcrypt.compare(password, storedHashedPassword);
        if (check) {
          req.session.user=result.rows[0];
          res.redirect('/auth/dashboard');
        } else {
          res.status(401).json({message:"Incorrect"});
        }
      } else {
        res.status(401).send("No user found with the provided username");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Error occurred while processing the request");
    }
});
  
router.get('/sign-up', (req, res) => {
    if(req.session.user){
      res.redirect('/dashboard');
      return;
    }
    res.render('registration')
});

router.post('/sign-up', async (req, res) => {
    const { username, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *';
    const values = [username, hashedPassword];
    try{
      const result = await pool.query(query, values);
      req.session.user = result.rows[0];
      res.redirect('/auth/dashboard/')
    }catch (error) {
      console.error(error);
      res.status(500).send('Error registering user');
    }
});

router.get('/dashboard', loginRequired, (req, res) => {
    res.render('dashboard', {user:req.session.user});
});

router.get('/sign-out', loginRequired, (req, res) => {
    req.session.destroy(err => {
      if (err) {
        console.error(err);
        res.status(500).send('Error');
      } else {
        res.redirect('/auth/sign-in');
      }
    });
});

module.exports = router;