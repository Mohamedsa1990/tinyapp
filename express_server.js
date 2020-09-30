const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

// middleware
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.set('view engine', 'ejs');

app.get('/register', (req, res) => {

  res.render('registeration');
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// routes

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL; 
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longUrl = urlDatabase[req.params.shortURL];
  res.redirect(longUrl);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],username: req.cookies["username"] };
  res.render("urls_show", templateVars);
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
  res.cookie('username', req.body.username);
  res.redirect('/urls');
})

app.post("/logout", (req,res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});


// confirmation that the server is on

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
})

// functions

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}



