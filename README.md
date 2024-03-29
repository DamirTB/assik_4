## Setup to use the application

```
npm install
```

```
npm start
```


## PgAdmin create tables

Create those tables in your database postgres

```
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    time_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    birthdate DATE DEFAULT NULL,
    age INTEGER DEFAULT NULL,
    gender VARCHAR(10) DEFAULT 'male' CHECK (gender IN ('male', 'female'))
);
```

```
CREATE TABLE posts (
    post_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

```
CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    post_id INT REFERENCES posts(post_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author TEXT NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```