const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username)=>{
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) { 
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registred. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});    
    }
  } 
  return res.status(404).json({message: "Unable to register user."});
});

const allBooksPromise = new Promise((resolve,reject)=>{
  try {
    const data = JSON.stringify(books,null,4); 
    resolve(data);
  } catch(err) {
    reject(err)
  }
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  allBooksPromise.then(
    (data) => res.status(200).send(data),
    (err) => res.status(404).send("Error retrieving book list")
  );
});

const bookDetailsPromise = (isbn) => new Promise((resolve,reject)=>{
    try {
      const data = books[isbn]; 
      resolve(data);
    } catch(err) {
      reject(err)
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    let isbn = req.params.isbn;
    bookDetailsPromise(isbn).then(
      (data) => res.status(200).send(data),
      (err) => res.status(404).send("Error retrieving book details")
    );
 });

 const authorPromise = (author) => new Promise((resolve,reject)=>{
  try {
    let data = [];
    for (const key in books) {
      if(books[key].author === author) {
        data.push(books[key]);
      }
    }
    resolve(data);
  } catch(err) {
    reject(err)
  }
});

// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  let author = req.params.author;
  authorPromise(author).then(
    (data) => res.status(200).send(data),
    (err) => res.status(404).send("Error retrieving book details by author")
  );
});

const titlePromise = (title) => new Promise((resolve,reject)=>{
  try {
    let data = [];
    for (const key in books) {
      if(books[key].title === title) {
        data.push(books[key]);
      }
    }
    resolve(data);
  } catch(err) {
    reject(err)
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  let title = req.params.title;
  titlePromise(title).then(
    (data) => res.status(200).send(data),
    (err) => res.status(404).send("Error retrieving book details by title")
  );
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  let isbn = req.params.isbn;
  let reviews = books[isbn].reviews;
  res.send(reviews);
});

module.exports.general = public_users;
