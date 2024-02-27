const express = require('express');
const router = express.Router();
const session = require('express-session');
const pool = require('../db/db')
const { loginRequired, roleRequired } = require('../middleware/middleware');

router.get('/', roleRequired('admin'), (req, res) => {
    res.render('admin/admin')
})

router.get('/users', roleRequired('admin'), async(req, res) => {
    try{
        const query = 'SELECT * FROM users';
        const {rows} = await pool.query(query);
        const cur_user = req.session.user;
        res.render('admin/users', {users : rows});
    }catch(error){
        console.log(error);
    }
});

router.get('/users/:id', roleRequired('admin'), async(req, res) => {
    try{
        const query = 'DELETE FROM users WHERE user_id = $1';
        const id = req.params.id;
        await pool.query(query, [id]);
        res.redirect('/admin/users');
    }catch(error){
        console.log(error);
    }
})

module.exports = router