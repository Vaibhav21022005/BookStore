// routes/book.js
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken")
const Book = require("../models/book");
const { authenticateToken } = require("./userAuth");

// add book -- admin
router.post("/add-book", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;
    const user = await User.findById(id);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "You don't have admin access" });
    }

    const book = new Book({
      url: req.body.url,
      title: req.body.title,
      author: req.body.author,
      price: req.body.price,
      desc: req.body.desc,
      language: req.body.language,
    });
    await book.save();
    return res.status(200).json({ message: "Book added successfully", data: book });
  } catch (error) {
    console.error("ADD BOOK ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// update book
router.put("/update-book", authenticateToken, async (req, res) => {
  try {
    const { bookid } = req.headers;
    if (!bookid) return res.status(400).json({ message: "bookid missing in headers" });

    const updated = await Book.findByIdAndUpdate(
      bookid,
      {
        url: req.body.url,
        title: req.body.title,
        author: req.body.author,
        price: req.body.price,
        desc: req.body.desc,
        language: req.body.language,
      },
      { new: true }
    );
    return res.status(200).json({ message: "Book updated successfully", data: updated });
  } catch (error) {
    console.error("UPDATE BOOK ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// delete book
router.delete("/delete-book", authenticateToken, async (req, res) => {
  try {
    const { bookid } = req.headers;
    if (!bookid) return res.status(400).json({ message: "bookid missing" });
    await Book.findByIdAndDelete(bookid);
    return res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("DELETE BOOK ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// get all books
router.get("/get-all-books", async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    return res.json({ status: "Success", data: books });
  } catch (error) {
    console.error("GET ALL BOOKS ERROR:", error);
    return res.status(500).json({ message: "An error occurred" });
  }
});

// get recent (limit 4)
router.get("/get-recent-books", async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 }).limit(4);
    return res.json({ status: "Success", data: books });
  } catch (error) {
    console.error("GET RECENT BOOKS ERROR:", error);
    return res.status(500).json({ message: "An error occurred" });
  }
});

// get book by id
router.get("/get-book-by-id/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    return res.json({ status: "Success", data: book });
  } catch (error) {
    console.error("GET BOOK BY ID ERROR:", error);
    return res.status(500).json({ message: "An error occurred" });
  }
});

module.exports = router;
