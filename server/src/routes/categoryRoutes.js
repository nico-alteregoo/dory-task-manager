import express from "express";

import protectRoute from "../middleware/auth.middleware.js";
import Category from "../models/Category.js";

const router = express.Router();

router.post('/', protectRoute, async (req, res) => {

  try {
    const { name } = req.body;
    const userId = req.user.id;

    // validation
    if(!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // check existing
    const isCategoryExisting = await Category.findOne({
      where: {
        name,
        userId
      }
    });

    if(isCategoryExisting) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await Category.create({
      name,
      userId
    });

    return res.status(201).json({
      category: category.name
    });    

  } catch (error) {
    console.log("Error creating category", error);
    return res.status(500).json({ message: "Internal server error" });
  }

});

router.get('/', protectRoute, async (req, res) => {
  
  try {
    const userId = req.user.id;
    const categories = await Category.findAll({
      where: {userId}
    });

    return res.json({ 
      categories
     });

  } catch (error) {
    console.log("Error in getting categories", error);
    res.status(500).json({ message: "Internal server error"});
  }
});

export default router;