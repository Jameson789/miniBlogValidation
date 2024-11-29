const express = require('express');

const app = express();

const PORT = 3000; 

const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'blog'

});

async function connect() {
    try {
    let conn = await pool.getConnection();
    console.log("Connected to Database");
    return conn;
    } catch (err){
        console.log("error connecting to the dataBase: " + err);
    }
} 
//connect();
app.use(express.urlencoded({ extended: false }));

app.use(express.static('public'));

app.set('view engine', 'ejs'); 

app.get('/', (req, res) => {
    console.log("Hello, world - server!");
    res.render('home', {data: [], errors: []});
});

app.post('/submit', async (req, res) => {
    
    let newPost = {
        name: req.body.author,
        title: req.body.title,
        content: req.body.content
    }; 
    let isValid = true;
    let errors = [];

    if (newPost.name.trim() === ''){
        newPost.name = null;
        console.log(newPost.name);
    }

    let title = newPost.title.trim();
    if (title.length < 5){
        isValid = false;
        errors.push('Title must be longer than 5 characters')
    }

    if (newPost.content.trim() === ''){
        isValid = false;
        errors.push('Post is requried');
    }

    if(!isValid) {
        res.render('home', {data: newPost, errors: errors});
        return;
    }
    const conn = await connect();
    conn.query(`INSERT INTO posts (author, title, content) VALUES ('${newPost.name}', '${newPost.title}', '${newPost.content}');`)
    res.render('confirmation', { post:newPost })
});

app.get('/entries', async (req, res) => {
    const conn = await connect();
    let posts = await conn.query(`SELECT * FROM posts ORDER BY created_at DESC;`);
    console.log(posts);
    res.render('entries', { posts : posts });
});

app.get('/home', (req, res) => {
    res.render('home', {data: [], errors: []});
});

app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`)
});
