const express = require('express');
const router = express.Router();
const session = require('express-session');
const pool = require('../db/db')
const {loginRequired} = require('../middleware/middleware');

router.post('/create', loginRequired, async(req, res) => {
    try{
        const {title, content} = req.body;
        const author = req.session.user.user_id;
        const query = `INSERT INTO posts (title, content, user_id) VALUES ($1, $2, $3) RETURNING *`;
        const values = [title, content, author];
        const result = await pool.query(query, values);
        res.redirect('/post/forum');
    }catch(error){
        console.error(error);
        res.status(500).send("error craeting post");
    }
});

router.get('/forum', loginRequired, async(req, res) => {
    try{
        const query = 'SELECT * FROM posts';
        const {rows} = await pool.query(query);
        const user = req.session.user
        res.render('post/posts', {posts : rows, user : user});
    }catch(error){
        console.error(error);
    }
});

router.get('/delete/:id', loginRequired, async(req, res) => {
    try{
        const id = req.params.id;
        const query = `DELETE FROM posts where post_id=$1`;
        await pool.query(query, [id]);
        res.redirect('/post/forum');
    }catch(error){
        console.log(error);
    }
});

router.get('/:id', loginRequired, async (req, res) => {
    try {
        const id = req.params.id;
        const query = `SELECT * FROM "posts" WHERE post_id = $1`;
        const row = await pool.query(query, [id]);
        res.render('post/single_post', { post: row.rows[0] });
    } catch (error) {
        console.error(error);
    }
});

module.exports = router