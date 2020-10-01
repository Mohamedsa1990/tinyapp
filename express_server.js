// Tiny App

// calling express and setting up the port ---------------
const express = require('express');
const app = express();
const PORT = 8080; // default port 8080


// helper functions ----------------------------------

const { emailLookup , generateRandomString , urlsForUser } = require('./helpers.js');


// middleware --------------------------------------------------
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['Mohammed', 'Hello'], // cookies encryption keys
}));

app.set('view engine', 'ejs');

const bcrypt = require('bcrypt');


// global variables --------------------------------------------------

const urlDatabase = {};

const defTemplateVars = {
  user : null,
};

const users = {};


// routes --------------------------------------------------

// GET Requests

// login route ===============done=====================
app.get('/login', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.render('login', defTemplateVars);
  }
});

// register route ========done======================
app.get('/register', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.render('registeration', defTemplateVars);
  }
});

// Home route =====================done=========================

app.get("/", (req, res) => {
  const id = req.session.user_id;
  const userURl = urlsForUser(id, urlDatabase);
  const templateVars = {
    urls: userURl,
    user: users[id],
  };
  if (templateVars.user) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});


// urls page ====================done=====================
app.get("/urls", (req, res) => {
  const userURl = urlsForUser(req.session.user_id, urlDatabase);
  const templateVars = {
    urls: userURl,
    user: users[req.session.user_id],
  };
  if (templateVars.user) {
    res.render("urls_index", templateVars);
  } else {
    res.render('urls_index', defTemplateVars);
  }
});

// new url route ============done====================
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

// redirecting route =================done=======================
app.get("/u/:shortURL", (req, res) => {
  const longUrl = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longUrl);
});

// show the url info ==============done==================
app.get("/urls/:shortURL", (req, res) => {
  const id = req.session.user_id;
  const databaseId = urlDatabase[req.params.shortURL].userID;
  if (id) {
    if (databaseId === id) {
      const templateVars = {
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL].longURL,
        user: users[id],
      };
      res.render("urls_show", templateVars);
    } else {
      res.send('you dont have such URL');
    }
  } else {
    res.render('urls_index', defTemplateVars);
  }
});



// post requests

// adding new url from user and store it in DB ============done==========
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  res.redirect(`/urls/${shortURL}`);
});

// delete existing url =============done===========================
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.status(404);
    res.send('can\'t pereform this operation');
  }
});

// modify existing url =================done========================
app.post("/urls/:shortURL/modify", (req, res) => {
  const id = req.session.user_id;
  const databaseId = urlDatabase[req.params.shortURL].userID;
  if (id === databaseId) {
    const url = req.params.shortURL;
    const newUrl = req.body.URL;
    urlDatabase[url].longURL = newUrl;
    res.redirect('/urls');
  } else {
    res.status(404);
    res.send('can\'t pereform this operation');
  }
});

// login =================done=========================
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = emailLookup(email, users);
  if (user) {
    const passwordMatching = bcrypt.compareSync(password, users[user].password);
    if (passwordMatching) {
      req.session.user_id = users[user].id;
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

// logout ================done===============================
app.post("/logout", (req,res) => {
  req.session = null;
  res.redirect('/urls');
});

//register =================done============================
app.post('/register', (req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (email === "" || password === "") {
    res.status(400);
    res.send('Invalid Email or password');
  } else if (emailLookup(email, users)) {
    res.status(400);
    res.send('Email already exists please remember your password or try forget my password featurer that are not exist yet');
  } else {
    const id = generateRandomString();
    users[id] = {
      id : id,
      email: email,
      password: hashedPassword,
    };
    req.session.user_id = id;
    res.redirect('/urls');
  }
});


// confirmation that the server is on --------------------------------------------------

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
