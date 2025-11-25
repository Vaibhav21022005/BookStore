// routes/order.js
const router = require("express").Router();
const { authenticateToken } = require("./userAuth");
const Order = require("../models/order");
const User = require("../models/user");

// place order
router.post("/place-order", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;
    const { order } = req.body;

    if (!id || !order || !Array.isArray(order) || order.length === 0) {
      return res.status(400).json({ message: "Invalid request" });
    }

    for (const orderData of order) {
      const newOrder = new Order({ user: id, book: orderData._id });
      const saved = await newOrder.save();

      // push to user orders
      await User.findByIdAndUpdate(id, { $push: { orders: saved._id } });
      // pull from cart
      await User.findByIdAndUpdate(id, { $pull: { cart: orderData._id } });
    }

    return res.json({ status: "Success", message: "Order Placed Successfully" });
  } catch (error) {
    console.error("PLACE ORDER ERROR:", error);
    return res.status(500).json({ message: "Backend Error Occurred" });
  }
});

// get order history for user
router.get("/get-order-history", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;
    if (!id) return res.status(400).json({ message: "User id missing" });

    // find orders for this user, populate book
    const orders = await Order.find({ user: id }).populate("book").sort({ createdAt: -1 });
    return res.json({ status: "Success", data: orders });
  } catch (error) {
    console.error("GET ORDER HISTORY ERROR:", error);
    return res.status(500).json({ message: "Backend Error Occurred" });
  }
});

// get all orders (admin)
router.get("/get-all-orders", authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find().populate("book").populate("user").sort({ createdAt: -1 });
    return res.json({ status: "Success", data: orders });
  } catch (error) {
    console.error("GET ALL ORDERS ERROR:", error);
    return res.status(500).json({ message: "An error occurred" });
  }
});

// update order status (admin)
router.put("/update-status/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await Order.findByIdAndUpdate(id, { status });
    return res.json({ status: "Success", message: "Status updated successfully" });
  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error);
    return res.status(500).json({ message: "An error occurred" });
  }
});


module.exports = router;
