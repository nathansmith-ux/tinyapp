const { assert } = require('chai');
const { generateRandomString, getUserByEmail, urlsForUser } = require('../helpers.js');

// Test Data
const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "Das78!",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "Das78!"
  },
  "dae8dN": {
    longURL: "http://wikipedia.com",
    userID: "rLCvzw"
  }
};


// Tests to determine if a random string is being created
describe('generateRandomString', function() {
  it('should return a string', function() {
    const randomString = generateRandomString();

    assert.isString(randomString);
  });

  it('should return a unique string each time it is called', function() {
    const firstString = generateRandomString();
    const secondString = generateRandomString();

    assert.notStrictEqual(firstString, secondString);
  });
});


// Tests for helper function that checks if email is in the database
describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";

    assert.strictEqual(user.id, expectedUserID);
  });

  it('should return null if the email is not in the database', function() {
    const user = getUserByEmail("nonexistent@example.com", testUsers);

    assert.isNull(user);
  });
});


// Tests to determine if urls match a cookie id
describe('urlsForUser', function() {
  it('should return a correct user ID', function() {
    const user = urlsForUser("rLCvzw", testDatabase);
    const expectedUserID = "rLCvzw";

    assert.strictEqual(user["dae8dN"].userID, expectedUserID);
  });

  it('should return an empty Object when there is no matching user ID', function() {
    const user = urlsForUser("nothing", testDatabase);
    const expectedUserID = {};
    
    assert.deepEqual(user, expectedUserID);
  });

  it('should return multiple user IDs if it matches', function() {
    const user = urlsForUser("Das78!", testDatabase);
    const expectedUserID = "Das78!";

    assert.strictEqual(user["b2xVn2"].userID, expectedUserID);
    assert.strictEqual(user["9sm5xK"].userID, expectedUserID);
  });
});
