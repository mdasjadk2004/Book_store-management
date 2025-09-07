// client.js
const axios = require("axios");

const BASE = "http://localhost:3000";

// Task 10: Get all books – Using async callback function (async/await)
async function getAllBooks() {
  try {
    const resp = await axios.get(`${BASE}/books`);
    console.log("Task 10 - All books:");
    console.log(resp.data);
  } catch (err) {
    console.error("Error fetching all books:", err.response ? err.response.data : err.message);
  }
}

// Task 11: Search by ISBN – Using Promises (.then)
function searchByISBN(isbn) {
  axios.get(`${BASE}/books/isbn/${isbn}`)
    .then(resp => {
      console.log("Task 11 - ISBN search result:");
      console.log(resp.data);
    })
    .catch(err => {
      console.error("Error in ISBN search:", err.response ? err.response.data : err.message);
    });
}

// Task 12: Search by Author – async/await
async function searchByAuthor(author) {
  try {
    const resp = await axios.get(`${BASE}/books/author/${encodeURIComponent(author)}`);
    console.log("Task 12 - Author search result:");
    console.log(resp.data);
  } catch (err) {
    console.error("Error in author search:", err.response ? err.response.data : err.message);
  }
}

// Task 13: Search by Title – Promises (.then)
function searchByTitle(title) {
  axios.get(`${BASE}/books/title/${encodeURIComponent(title)}`)
    .then(resp => {
      console.log("Task 13 - Title search result:");
      console.log(resp.data);
    })
    .catch(err => {
      console.error("Error in title search:", err.response ? err.response.data : err.message);
    });
}

/* Run them in sequence for the lab demonstration */
(async () => {
  await getAllBooks();
  searchByISBN("9780143127741");
  await searchByAuthor("Harari");
  searchByTitle("Introduction to Algorithms");
})();
