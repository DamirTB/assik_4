const express = require('express');
const router = express.Router();
const loginRequired = require('../middleware/loginRequired');
const session = require('express-session');
const pool = require('../db/db')

router.get('/create', (req, res) =>{
    res.render('')
})