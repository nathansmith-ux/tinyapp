const express = require("express");
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');

const app = express();
const PORT = 8080;
const saltRounds = 10;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['lighthouse-labs'],
  maxAge: 24 * 60 * 60 * 1000 // Expires in 24 hours
}));

/**
 * Function generates a random 6 letter string
 * @returns string that consists of a random series of letters numbers or symbols
 */
function generateRandomString() {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#*";
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

// Base-Level Database holding shortURLs and longURLs
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "rLCvzw",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "rLCvzw"
  }
};

// Database holding user IDs, email and passwords
const password = "12345";
const hashedPassword = bcrypt.hashSync(password, saltRounds);

const users = {
  rLCvzw: {
    id: "rLCvzw",
    email: "test@gmail.com",
    hashedPassword: hashedPassword
  }
};


/**
 * Function checks if an email exists in the users object
 * @param {email} email
 * @return users object or null
 */
function getUserByEmail(email) {
  for (const userInfo in users) {
    if (users[userInfo].email === email) {
      return users[userInfo];
    }
  }
  return null;
}

/**
 * Function filters the urls that match cookie id and put into a new object
 * @param {cookie id} id
 * @returns A new url object
 */
function urlsForUser(id) {
  let urlObj = {};

  for (let shortId in urlDatabase) {
    if (urlDatabase[shortId].userID === id) {
      urlObj[shortId] = urlDatabase[shortId];
    }
  }
  return urlObj;
}

// Not necessary to main app function
app.get("/", (req, res) => {
  res.send("Hello");
});

// App homepage where users can see all their URLs
app.get("/urls", (req, res) => {

  if (req.session.user_id) {

    const urls = urlsForUser(req.session.user_id);

    const templateVars = {
      user: users[req.session.user_id],
      urls: urls
    };

    return res.render("urls_index.ejs", templateVars);

  } else {
    return res.redirect("/login");
  }

});

// Posts randomly generating string with longURL to homepage
app.post("/urls", (req, res) => {
  
  if (!req.session.user_id) {
    res.send("To access this feature you need to have an account");

  } else {
    const randomString = generateRandomString();

    urlDatabase[randomString] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };

    res.redirect(`urls/${randomString}`);
  }

});

// Get request handles new login page
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };

  if (req.session.user_id) {
    return res.redirect("/urls");
  } else {
    return res.render("urls_login.ejs", templateVars);
  }
});

// Post handles user logins
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const existingUser = getUserByEmail(email);

  // Checking if user exists and tieing their id to their session
  if (existingUser && bcrypt.compareSync(password, existingUser.hashedPassword)) {
    req.session.user_id = existingUser.id;
    return res.redirect("/urls");

  } else {
    return res.status(403).send("Invalid Credentials");
  }

});

// Post handles user logouts
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// Get handles new user registration
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };

  if (req.session.user_id) {
    return res.redirect("/urls");
  } else {
    return res.render("urls_register.ejs", templateVars);
  }
});

// Post handles new user account creation
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const existingUser = getUserByEmail(req.body.email);
  const hashedPassword = bcrypt.hashSync(password, saltRounds);
  
  if (!email || !password) {
    return res.status(400).send("Invalid Credentials");
  }

  if (existingUser) {
    return res.status(400).send("Email already exists");
  }

  // Adds a new user to the database and protects their password
  let randomID = generateRandomString();
  users[randomID] = {
    id: randomID,
    email: email,
    hashedPassword: hashedPassword
  };

  req.session.user_id = randomID;
  res.redirect("/urls");
});

// Redirects longURL to its respective domain
app.get("/u/:id", (req, res) => {
  const URL = urlDatabase[req.params.id].longURL;

  if (!URL) {
    return res.send("Uh Oh... Looks like your returned a whole lot of nothing. Please enter A valid ID and try again");
  } else {
    return res.redirect(URL);
  }
});

// Takes user to a page to create a new URL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };

  if (req.session.user_id) {
    return res.render("urls_new.ejs", templateVars);
  } else {
    return res.redirect("/login");
  }

});

// Page user is taken to when they create a new URL
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const url = urlDatabase[req.params.id];

  // Prevents users from accessing accounts or urls they don't own
  if (!req.session.user_id) {
    return res.send("Please login or create an account");
  
  } else if (!url) {
    return res.status(404).send("The url you tried accessing doesn't exist");

  } else if (url.userID !== req.session.user_id) {
    res.send("You don't have permission to view this URL");
  } else {
    
    const templateVars = {
      id: id,
      url: url.longURL,
      user: users[req.session.user_id],
    };
  
    res.render("urls_show.ejs", templateVars);
  }

});

// Deletes existing URL from the database on homepage
app.post("/urls/:id/delete", (req, res) => {
  const userInput = req.params.id;
  const urls = urlsForUser(req.session.user_id);
  
  // Prevents deleting urls that don't exist or user don't own
  if (!urlDatabase[userInput]) {
    return res.send("URL ID doesn't exist");

  } else if (!req.session.user_id) {
    return res.send("Please Login");

  } else if (!urls[userInput]) {
    return res.send("You can't delete another account's URL!!");

  } else {
    delete urlDatabase[userInput];
    res.redirect("/urls");

  }
});

// Grabs user edit input and updates URL database
app.post("/urls/:id", (req, res) => {
  const userInput = req.body.url;
  const urlId = req.params.id;
  const urls = urlsForUser(req.session.user_id);

  // Prevents editing urls that don't exist or user don't own
  if (!urlDatabase[urlId]) {
    return res.send("URL ID doesn't exist");

  } else if (!req.session.user_id) {
    return res.send("Please Login");

  } else if (!urls[urlId]) {
    return res.send("You can't edit another account's URL!!");
  } else {

    urlDatabase[req.params.id].longURL = userInput;
    res.redirect("/urls");
  }
});

// Not necessary for main app function
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Not necessary for main app function
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});