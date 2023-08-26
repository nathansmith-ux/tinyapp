/**
 * Function generates a random 6 letter string
 * @returns string that consists of a random series of letters numbers or symbols
 */
const generateRandomString = function() {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#*";
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

/**
 * Function checks if an email exists in the users object
 * @param {email} email
 * @return users object or null
 */
const getUserByEmail = function(email, database) {
  for (const userInfo in database) {
    if (database[userInfo].email === email) {
      return database[userInfo];
    }
  }
  return null;
};

/**
 * Function filters the urls that match cookie id and put into a new object
 * @param {cookie id} id
 * @returns A new url object
 */
const urlsForUser = function(id, database) {
  let urlObj = {};

  for (let shortId in database) {
    if (database[shortId].userID === id) {
      urlObj[shortId] = database[shortId];
    }
  }
  return urlObj;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser };