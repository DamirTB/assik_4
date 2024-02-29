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
        console.error(error);
    }
});

router.get('/users/:id', roleRequired('admin'), async(req, res) => {
    try{
        const query = 'DELETE FROM users WHERE user_id = $1';
        const id = req.params.id;
        await pool.query(query, [id]);
        res.redirect('/admin/users');
    }catch(error){
        console.error(error);
    }
})

router.get('/posts/', roleRequired('admin'), async(req, res) => {
    try{
        const query = `SELECT * FROM posts`;
        const {rows} = await pool.query(query);
        res.render('admin/posts', {posts:rows})
    }catch(error){
        console.error(error);
    }
})

router.get('/posts/:id', roleRequired('admin'), async(req, res) => {
    try{
        const query = 'DELETE FROM posts WHERE post_id = $1';
        const id = req.params.id;
        await pool.query(query, [id]);
        res.redirect('/admin/posts');
    }catch(error){
        console.error(error);
    }
})

router.get('/comments', roleRequired('admin'), async(req, res) => {
    try{
        const query = 'SELECT * FROM comments';
        const {rows} = await pool.query(query);
        res.render('admin/comments', {comments:rows});
    }catch(error){
        console.error(error);
    }
})

router.get('/')

module.exports = router