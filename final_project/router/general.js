const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (isValid(username)) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Register the user
  users.push({ username, password });
  res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
// public_users.get('/', function (req, res) {
//     res.json(Object.values(books));
// });

public_users.get('/', async function (req, res) {
  
  try {
    // Simulate fetching data using Axios
    const response = await axios.get('http://localhost:5000/books');
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch books", error: error.message });
  }
});



// Get book details based on ISBN using async-await
public_users.get('/isbn/:isbn', async function (req, res) {
  const { isbn } = req.params;

  try {

    const response = await axios.get(`http://localhost:5000/books`);
    const book = response.data[isbn];

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch book details", error: error.message });
  }
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const { author } = req.params;
  try {
    const response = await axios.get('http://localhost:5000/books');
    const authorBooks = Object.values(response.data).filter(book => book.author.toLowerCase() === author.toLowerCase());

    if (authorBooks.length === 0) {
      return res.status(404).json({ message: "Book not found" })
    }
    res.status(200).json(authorBooks)
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch book details", error: error.message })
  }
});



// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const { title } = req.params;
  
  try {
      // Fetch the book list from the external source
      const response = await axios.get('http://localhost:5000/books');
      
      // Filter books by title (case-insensitive)
      const titleBooks = Object.values(response.data).filter(book => 
          book.title.toLowerCase().includes(title.toLowerCase())
      );
      
      if (titleBooks.length === 0) {
          return res.status(404).json({ message: "No books found with this title" });
      }
      
      res.status(200).json(titleBooks);
  } catch (error) {
      res.status(500).json({ message: "Failed to fetch books by title", error: error.message });
  }
});


// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const book = books[req.params.isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  res.json(book.reviews);
});


module.exports.general = public_users;
