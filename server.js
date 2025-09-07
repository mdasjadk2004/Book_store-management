// server.js
// Simple in-memory book shop backend for Coursera project
const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();
app.use(bodyParser.json());

const JWT_SECRET = "replace_with_a_strong_secret_for_prod"; // for lab ok

// In-memory data stores (simple for lab)
let books = {
  "9780143127741": {
    isbn: "9780143127741",
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    reviews: {
      "alice": "Eye-opening!",
    }
  },
  "9780131103627": {
    isbn: "9780131103627",
    title: "The C Programming Language",
    author: "Brian W. Kernighan",
    reviews: {}
  },
  "9780262033848": {
    isbn: "9780262033848",
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    reviews: {}
  }
};

let users = {}; // username -> { passwordHash, username }

// Helper: auth middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "Token missing" });
  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token missing" });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user; // { username }
    next();
  });
}

/* -------------------- Public routes for General Users -------------------- */

// Task 1: Get the book list available in the shop.
app.get("/books", (req, res) => {
  // return array of books (without exposing internal reviews object directly)
  const list = Object.values(books).map(b => ({ isbn: b.isbn, title: b.title, author: b.author }));
  res.json({ books: list });
});

// Task 2: Get the books based on ISBN.
app.get("/books/isbn/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });
  res.json(book);
});

// Task 3: Get all books by Author.
app.get("/books/author/:author", (req, res) => {
  const author = req.params.author.toLowerCase();
  const found = Object.values(books).filter(b => b.author.toLowerCase().includes(author));
  res.json({ books: found });
});

// Task 4: Get all books based on Title.
app.get("/books/title/:title", (req, res) => {
  const title = req.params.title.toLowerCase();
  const found = Object.values(books).filter(b => b.title.toLowerCase().includes(title));
  res.json({ books: found });
});

// Task 5: Get book Review.
app.get("/books/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });
  res.json({ isbn, reviews: book.reviews });
});

/* -------------------- Registration & Login -------------------- */

// Task 6: Register New user
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "username and password required" });
  if (users[username]) return res.status(409).json({ message: "User already exists" });
  const passwordHash = await bcrypt.hash(password, 10);
  users[username] = { username, passwordHash };
  res.status(201).json({ message: "User registered", username });
});

// Task 7: Login as a Registered user
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ message: "Login successful", token });
});

/* -------------------- Registered Users allowed endpoints -------------------- */

// Task 8: Add/Modify a book review. (Authenticated)
app.put("/auth/review/:isbn", authenticateToken, (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;
  if (!review) return res.status(400).json({ message: "Review text required" });
  const book = books[isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });
  const username = req.user.username;
  book.reviews[username] = review; // add or modify
  res.json({ message: "Review added/modified", isbn, reviews: book.reviews });
});

// Task 9: Delete book review added by that particular user (Authenticated)
app.delete("/auth/review/:isbn", authenticateToken, (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });
  const username = req.user.username;
  if (!book.reviews[username]) return res.status(404).json({ message: "Review by user not found" });
  delete book.reviews[username];
  res.json({ message: "Review deleted", isbn, reviews: book.reviews });
});

/* -------------------- Server start -------------------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bookshop backend listening on port ${PORT}`);
  console.log("Available endpoints:");
  console.log("GET /books");
  console.log("GET /books/isbn/:isbn");
  console.log("GET /books/author/:author");
  console.log("GET /books/title/:title");
  console.log("GET /books/review/:isbn");
  console.log("POST /register");
  console.log("POST /login");
  console.log("PUT /auth/review/:isbn");
  console.log("DELETE /auth/review/:isbn");
});
