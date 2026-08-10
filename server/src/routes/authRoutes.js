import express from "express";
import User from "../models/User.js";
import { where } from "sequelize";
import jwt from "jsonwebtoken";
import "dotenv/config";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d"}
  );
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // validate input (general validation)
    if(!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required "});
    }

    // specific validation
    if(name.length < 3) {
      return res.status(400).json({ message: "Name should be atleast 3 characters long"});
    }

    if(password.length < 6) {
      return res.status(400).json({ message: "Password should be atleast 6 characters long"});
    }

    if(!email.includes("@")) {
      return res.status(400).json({ message: "Please enter a valid email"});
    }

    const existingEmail = await User.findOne({
      where: {email}
    });

    if(existingEmail) {
      return res.status(400).json({ message: "Email already exists"});
    }

    const user = await User.create({
      name,
      email,
      password
    });

    return res.status(201).json({ message: "User created successfully" });

  } catch (error) {
    console.log("Error creating user", error);
    res.status(500).json({ message: "Internal server error"});
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if(!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // check if user exists
    const user = await User.findOne({
      where: {email}
    });

    if(!user) {
      return res.status(400).json({ message: "Invalid credentials"});
    }

    // check password
    const isPasswordCorrect = await user.comparePassword(password);

    if(!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials"});
    }

    // generate token
    const token = await generateToken(user.id);

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    });


  } catch (error) {
    console.log("Error in login route", error);
    res.status(500).json({ message: "Internal server error"});
  }
})

router.get('/me', protectRoute, async (req, res) => {

  try {
    const user = req.user;

    // console.log(user);
    if(!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    return res.json({
      user: user
    });

    
  } catch (error) {
    console.log("Error getting user", error);
    return res.status(500).json({ message: "Internal server error"});
  }

})

export default router;