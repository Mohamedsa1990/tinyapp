const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

// middleware --------------------------------------------------
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.set('view engine', 'ejs');

const bcrypt = require('bcrypt');


// global variables --------------------------------------------------

const urlDatabase = {};

const defTemplateVars = {
  user : null,
}

const users = {};



// app.get("/urls.json", (req, res) => {
  //   res.json(urlDatabase);
  // });
  
// routes --------------------------------------------------

// GET Requests


app.get('/login', (req, res) => {
  res.render('login', defTemplateVars);
});

app.get('/register', (req, res) => {
  res.render('registeration', defTemplateVars);
});

app.get("/urls", (req, res) => {
  const userURl = urlsForUser(req.cookies["user_id"])
  const templateVars = { 
    urls: userURl,
    user: users[req.cookies["user_id"]],
  };
  // console.log('database', urlDatabase)
  console.log('user', users)
  if (templateVars.user) {
    res.render("urls_index", templateVars);
  } else {
    res.render('urls_index', defTemplateVars)
  }
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]],
  };
  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login')
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longUrl = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longUrl);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies["user_id"]],
   };
  res.render("urls_show", templateVars);
});



// post requests

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { 
    longURL: req.body.longURL,
    userID: req.cookies['user_id'],
  } 
  res.redirect('/urls');
});


app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.cookies['user_id'] === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.status(404);
    res.send('can\'t pereform this operation')
  }
});

app.post("/urls/:shortURL/modify", (req, res) => {
  if (req.cookies['user_id'] === urlDatabase[req.params.shortURL].userID) {
    const url = req.params.shortURL;
    const newUrl = req.body.URL;
    urlDatabase[url].longURL = newUrl;
    res.redirect('/urls');
  } else {
    res.status(404);
    res.send('can\'t pereform this operation')
  }
}); 

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = emailLookup(email);
  if (user) {
    const passwordMatching = bcrypt.compareSync(password, users[user].password);
    if (passwordMatching) {
      res.cookie('user_id', users[user].id);
      res.redirect('/urls');
    } else {
      res.status(403);
      res.send('Invalid Password');
    }
  } else {
    res.status(403);
    res.send('invalid email please register');
  }
});

app.post("/logout", (req,res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post('/register', (req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if(email === "" || password === "") {
    res.status(400);
    res.send('Invalid Email or password');
  } else if (emailLookup(email)) {
    res.status(400);
    res.send('Email already exists please remember your password or try forget my password featurer that are not exist yet');
  } else {
  const id = generateRandomString();
  users[id] = { 
    id : id,
    email: email,
    password: hashedPassword,
  }
  res.cookie('user_id', id);
  res.redirect('/urls');
  }
});


// confirmation that the server is on --------------------------------------------------

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
})

// functions --------------------------------------------------

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

function emailLookup(email) {
  for(let user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
  return false;
}


function urlsForUser(id) {
  const userURLs = {};
  for(let url in urlDatabase) {
    if(urlDatabase[url].userID === id) {
      userURLs[url] = urlDatabase[url];
    }
  }
  return userURLs;
}



