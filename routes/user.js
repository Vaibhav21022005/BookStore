const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./userAuth");

// Sign Up
router.post("/sign-up", async (req, res) => {
    try {
        const { username, email, password, address } = req.body;

        if (username.length < 4) {
            return res.status(400).json({ message: "Username length should be greater than 3" });
        }

        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: "Username already exists" });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: "Email already exists" });
        }

        if (password.length <= 5) {
            return res.status(400).json({ message: "Password length should be greater than 5" });
        }

        const hashPass = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            password: hashPass,
            address,
        });

        await newUser.save();
        return res.status(200).json({ message: "SignUp Successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Sign In
router.post("/sign-in", async (req, res) => {
    try {
        const { username, password } = req.body;

        const existingUser = await User.findOne({ username });
        if (!existingUser) {
            return res.status(400).json({ message: "Invalid Credential" });
        }

        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credential" });
        }

        const authClaims = [
            { name: existingUser.username },{ role: existingUser.role }
        ];

        const token = jwt.sign({ authClaims }, "bookStore123", { expiresIn: "30d" });
        res.status(200).json({ id: existingUser._id, role: existingUser.role, token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Get user information
router.get("/get-user-information", authenticateToken, async (req, res) => {
    try {
        const { id } = req.headers;
        const data = await User.findById(id).select("-password");
        return res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
//update address
router.put("/update-address", authenticateToken, async (req, res) => {
    try{
        const { id } = req.headers;
        const {address} =  req.body;
        await User.findByIdAndUpdate(id,{address:address});
        return res.status(200).json({message:"Adress updated successufully"});
    }catch(error){
        res.status(500).json({ message: "Internal Server Error" });
    }
})
module.exports = router;
