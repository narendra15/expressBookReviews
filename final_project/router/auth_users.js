const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    // Check if the username exists in the user list
    return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
    // Check if the username and password match the records
    const user = users.find(u => u.username === username && u.password === password);
    return user ? true : false;
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!isValid(username)) {
        return res.status(404).json({ message: "User not found" });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid password" });
    }

    // Create and assign a JWT token
    const token = jwt.sign({ username }, 'your_jwt_private_key', { expiresIn: '1h' });
    res.json({ message: "Login successful", token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;
    const book = books[isbn];

    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!req.user) {
        return res.status(403).json({ message: "You must be logged in to review" });
    }

    // Add review to the book
    book.reviews[req.user.username] = review;
    res.status(200).json({ message: "Review added", book });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;

  if (!req.user || !req.user.username) {
      return res.status(401).json({ message: "Access denied. Invalid user session." });
  }

  if (books[isbn] && books[isbn].reviews[req.user.username]) {
      // Delete the review by the logged-in user
      delete books[isbn].reviews[req.user.username];
      return res.status(200).json({ message: "Review deleted successfully." });
  } else {
      return res.status(404).json({ message: "Review not found or you don't have permission to delete it." });
  }
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
