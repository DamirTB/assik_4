const express = require('express');
const router = express.Router();
const session = require('express-session');
const pool = require('../db/db')
const { loginRequired, roleRequired } = require('../middleware/middleware');

router.get('/', roleRequired('admin'), (req, res) => {
    res.render('admin')
})

module.exports = router