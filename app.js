const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');
const ejs = require('ejs');
const axios = require('axios');

const app = express();
const port = 3000;
app.set('view engine', 'ejs');

const pool = new Pool({
  user: 'postgres', 
  host: 'localhost',
  database: 'postgres',
  password: '12345',
  port: 5432,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const loginRequired = (req, res, next) => {
  if (!req.session.user || !req.session.user.username) {
    return res.status(401).redirect('/sign-in')
  }
  next();
};

app.use(session({
    secret: "Secret_key",
    resave: false, 
    saveUninitialized: false
}));

const templates = path.join(__dirname, 'templates');

app.get('/sign-in', (req, res) =>{
  if(req.session.user){
    res.redirect('/dashboard');
    return;
  }
  res.sendFile(path.join(templates + '/login.html'));
});
 
app.get('/dashboard', loginRequired, async (req, res) => {
  try {
    const username = req.session.user.username;

    const query = 'SELECT * FROM book WHERE taken = $1';
    const { rows } = await pool.query(query, [username]);

    res.render('dashboard', { username: username, books: rows });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving books');
  }
});

app.post('/post', loginRequired, async (req, res) => {
  try {
    const name = req.body.name;
    const text = req.body.text;
    const author = req.session.user.username;
    const query = 'INSERT INTO posts (name, text, author) VALUES ($1, $2, $3) RETURNING *';
    const values = [name, text, author];
    const result = await pool.query(query, values);
    res.redirect('/posts');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error inserting posts');
  }
});

app.post('/post/:id', loginRequired, async(req, res) => {
  try {
    const text = req.body.text;
    const author = req.session.user.username;
    const id_post = req.params.id; 
    if (!text || !id_post) {
      return res.status(400).json({ error: 'Text and post ID are required' });
    }
    const query = 'INSERT INTO comment (text, author, id_post) VALUES ($1, $2, $3) RETURNING *';
    const values = [text, author, id_post];
    const { rows } = await pool.query(query, values);
    res.redirect(`/post/${id_post}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error inserting comment' });
  }
});

app.get('/post/:id', loginRequired, async (req, res) => {
  try {
    const id = req.params.id;
    const query = 'SELECT * FROM posts WHERE id = $1'; 
    const query_comment = "SELECT * FROM comment WHERE id_post = $1";
    const { rows, rowCount } = await pool.query(query, [id]);
    const { rows : comment} = await pool.query(query_comment, [id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    //res.json(comment);
    //console.log(rows_comm);
    res.render('single_post', {post : rows[0], comment : comment});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error retrieving post' });
  }
});

app.get('/posts', loginRequired, async (req, res) => {
  const username = req.session.user.username
  console.log(username)
  const query = 'SELECT * FROM posts';
  const { rows } = await pool.query(query);
  const reversedRows = rows.reverse(); // Reverse the array
  res.render('posts', { posts: reversedRows});
});

app.get('/sign-out', loginRequired, (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      res.status(500).send('Error');
    } else {
      res.redirect('/sign-in');
    }
  });
});

app.delete('/books/:tagId', loginRequired, async (req, res) => {
  try {
    const tagId = req.params.tagId;
    const query = 'DELETE FROM book WHERE id = $1';
    const { rowCount } = await pool.query(query, [tagId]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.status(204).json({complete:"ok"}); // Success: No content to send
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting book' });
  }
});

app.get('/books', loginRequired, async (req, res) => {
  try {
    const username = req.session.user.username;
    const query = 'SELECT * FROM book';
    const { rows } = await pool.query(query);
    res.render('books', { books: rows, username: username });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving books');
  }
});

app.get('/borrow/:tagId', loginRequired, async (req, res) => {
  try {
    const tagId = req.params.tagId;
    if (!req.session.user || !req.session.user.username) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const query = 'UPDATE book SET taken = $1 WHERE id = $2 RETURNING *';
    const values = [req.session.user.username, tagId];
    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.redirect('/books');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/sign-in', async (req, res) => {
  if(req.session.user){
    res.redirect('/dashboard');
    return;
  }
  const { username, password } = req.body;
  // if (!username || !password) {
  //   return res.status(400).json({
  //     message: "You have to fill in both fields"
  //   });
  // }
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length > 0) {
      const storedHashedPassword = result.rows[0].password;
      const check = await bcrypt.compare(password, storedHashedPassword);
      if (check) {
        req.session.user=result.rows[0];
        res.redirect('/dashboard');
        //res.status(200).json({message:"correct"});
        //res.json(result.rows[0]);
      } else {
        //res.status(401).send("Incorrect password");
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

app.get('/sign-up', (req, res) => {
  if(req.session.user){
    res.redirect('/dashboard');
    return;
  }
  res.sendFile(path.join(templates + '/registration.html'));
});

app.post('/sign-up', async (req, res) => {
  if(req.session.user){
    res.redirect('/dashboard');
    return;
  }
  const { username, email, password} = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const query = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *';
  const values = [username, email, hashedPassword];
  
  const userExistsQuery = 'SELECT * FROM users WHERE username = $1 OR email = $2';
  const userExistsValues = [username, email];
  try {
    const userExistsResult = await pool.query(userExistsQuery, userExistsValues);
    if (userExistsResult.rows.length > 0) {
      // User already exists
      return res.status(400).send('User with that username or email already exists');
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error checking user existence');
  }

  try{
    const result = await pool.query(query, values);
    req.session.user = result.rows[0];
    // req.session.user = {
    //   id: result.rows[0].id,
    //   username: result.rows[0].username,
    //   email: result.rows[0].email
    // }
    res.redirect('/dashboard/')
  }catch (error) {
    console.error(error);
    res.status(500).send('Error registering user');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
