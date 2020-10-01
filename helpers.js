// helper functions --------------------------------------------------




function emailLookup(email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return user;
    }
  }
  return undefined;
}


function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

function urlsForUser(id, database) {
  const userURLs = {};
  for (let url in database) {
    if (database[url].userID === id) {
      userURLs[url] = database[url];
    }
  }
  return userURLs;
}


module.exports = {
  emailLookup,
  urlsForUser,
  generateRandomString,
};