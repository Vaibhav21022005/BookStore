// routes/cart.js
const router = require("express").Router();
const User = require("../models/user");
const { authenticateToken } = require("./userAuth");

// add to cart
router.put("/add-to-cart", authenticateToken, async (req, res) => {
  try {
    const { bookid, id } = req.headers;
    if (!bookid || !id) return res.status(400).json({ status: "Failed", message: "Missing bookid or id" });

    const userData = await User.findById(id);
    if (!userData) return res.status(404).json({ status: "Failed", message: "User not found" });

    if (!userData.cart) userData.cart = [];

    const isBookInCart = userData.cart.some(b => b.toString() === bookid);
    if (isBookInCart) return res.status(200).json({ status: "Success", message: "Book is already in cart" });

    userData.cart.push(bookid);
    await userData.save();
    return res.status(200).json({ status: "Success", message: "Book added to cart" });
  } catch (error) {
    console.error("ADD TO CART ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
});

// remove from cart
router.put("/remove-from-cart/:bookid", authenticateToken, async (req, res) => {
  try {
    const { bookid } = req.params;
    const { id } = req.headers;
    if (!id) return res.status(400).json({ message: "User id missing" });

    await User.findByIdAndUpdate(id, { $pull: { cart: bookid } });
    return res.json({ status: "Success", message: "Book removed from cart" });
  } catch (error) {
    console.error("REMOVE FROM CART ERROR:", error);
    return res.status(500).json({ message: "An error occurred" });
  }
});

// get user cart (with book populated)
router.get("/get-user-cart", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;
    if (!id) return res.status(400).json({ message: "User id missing" });

    const userData = await User.findById(id).populate("cart");
    const cart = userData && userData.cart ? userData.cart.reverse() : [];
    return res.json({ status: "Success", data: cart });
  } catch (error) {
    console.error("GET USER CART ERROR:", error);
    return res.status(500).json({ message: "An error occurred" });
  }
});

module.exports = router;
