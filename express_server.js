const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

// middleware --------------------------------------------------
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.set('view engine', 'ejs');


// global variables --------------------------------------------------

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {};



// app.get("/urls.json", (req, res) => {
  //   res.json(urlDatabase);
  // });
  
// routes --------------------------------------------------

// GET Requests


app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('registeration');
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longUrl = urlDatabase[req.params.shortURL];
  res.redirect(longUrl);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]],
   };
  res.render("urls_show", templateVars);
});



// post requests

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL; 
  res.redirect(`/urls/${shortURL}`);
});


app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
}); 

app.post("/urls/:shortURL/modify", (req, res) => {
  const url = req.params.shortURL;
  const newUrl = req.body.URL;
  urlDatabase[url] = newUrl;
  res.redirect('/urls');
}); 

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = emailLookup(email);
  if (emailLookup(email)) {
    if (password === users[user].password) {
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
    email: req.body.email,
    password: req.body.password,
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
    } else {
      return false;
    }
  }
}



