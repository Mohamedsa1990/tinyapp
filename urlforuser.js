function emailLookup(email) {
  for(let user in users) {
    // console.log(user)
    // console.log(users[user].email === email)
    if (users[user].email === email) {
      return user;
    }
  }
  return false;
}



const users = {
  asdasd : {
    id : 'asdasd',
    email: 'mohammedsa1990@gmail.com',
    password: '123'
  },
  gggggg : {
    id : 'gggggg',
    email: 'mohammedsa@gmail.com',
    password: '123'
  }
};


console.log(emailLookup('mohammedsa111@gmail.com'))