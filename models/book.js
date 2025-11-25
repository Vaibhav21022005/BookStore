// models/book.js
const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    url: {
         type: String, 
         required: true 
        },
    title: { 
        type: String, 
        required: true 
    },
    author: { 
        type: String, 
        required: true 
    },
    price: { 
        type: Number, 
        required: true 
    },
    desc: { 
        type: String, 
        required: true 
    
    },
    language: { 
        type: String, 
        required: true 
    },
  },
  { timestamps: true }
);

// Export **model name** "Book" — use this exact string in refs/populate
module.exports = mongoose.model("Book", bookSchema);
