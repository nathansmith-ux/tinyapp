const express = require("express");
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080;
app.use(cookieParser());

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

/**
 * Function generates a random 6 letter string
 * @returns string that consists of a random series of letters numbers or symbols
 */
function generateRandomString() {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#*"
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }

  return result;
}

// Base-Level Database holding shortURLs and longURLs
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

// Not necessary to main app function
app.get("/", (req, res) => {
  res.send("Hello");
})

// App homepage where users can see all their URLs
app.get("/urls", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"],
    urls: urlDatabase 
  };
  console.log('cookies', req.cookies["username"]);
  res.render("urls_index.ejs", templateVars)
})

// Posts randomly generating string with longURL to homepage
app.post("/urls", (req, res) => {
  const randomString = generateRandomString()
  urlDatabase[randomString] = req.body.longURL;
  res.redirect(`urls/${randomString}`)
})

// Post handles user logins
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls")
})

// Redirects longURL to its respective domain
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (!longURL) {
    res.send("404 Error, enter a valid URL")
  }
  res.redirect(longURL)
})

// Takes user to a page to create a new URL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  }
  res.render("urls_new.ejs", templateVars)
})

// Page user is taken to when they create a new URL
app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"],
  }
  res.render("urls_show.ejs", templateVars)
})

// Deletes existing URL from the database on homepage
app.post("/urls/:id/delete", (req, res) => {
  const userInput = req.params.id
  delete urlDatabase[userInput]
  res.redirect("/urls")
})

// Grabs user edit input and updates URL database
app.post("/urls/:id", (req, res) => {
  const userInput = req.body.longURL
  urlDatabase[req.params.id] = userInput
  res.redirect("/urls")
})

// Not necessary for main app function
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})

// Not necessary for main app function
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
})