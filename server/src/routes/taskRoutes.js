import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
// import Category from "../models/Category.js";
// import Task from "../models/Task.js";
import { Task, Category } from "../models/index.js";
import { Op } from "sequelize";

const router = express.Router();

router.post('/', protectRoute, async (req, res) => {
  try {
    const { title, description, dueDate, category_id } = req.body;
    const userId = req.user.id;


    if (!title || title.trim() === "") {
      return res.status(400).json({
        message: "Title is required"
      });
    }

    if(!category_id) {
      return res.status(400).json({ message: "Category is required" });
    }

    const category = await Category.findOne({
      where: {
        id: category_id,
        userId
      }
    });
    
    if(!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const task = await Task.create({
      title,
      description,
      dueDate,
      categoryId: category_id,
      userId,
    });

    return res.status(201).json({
      task
    });

  } catch (error) {
    console.log("Error creating task", error);
    return res.status(500).json({ message: "Internal server error"});
  }
});

router.get('/', protectRoute, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, category_id, search } = req.query;
    const where = { userId };

    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    const offset = (page - 1) * limit;


    if(status) {
      where.status = status
    }

    if(category_id) {
      where.categoryId = category_id
    }

    if (search) {
      where.title = {
        [Op.like]: `%${search}%`
      };
    }

    // console.log('Where: ', where);

    const { count, rows } = await Task.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return res.json({
      tasks: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.log("Error fetching tasks", error);

    return res.status(500).json({
      message: "Internal server error"
    });    
  }
});

router.get('/:id', protectRoute, async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;

    const task = await Task.findOne({
      where: {
        id: taskId, 
        userId
      }, 
      include: [{
        model: Category
      }]
    });

    if(!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.json({
      task
    });

  } catch (error) {
    console.log("Error finding task", error);
    return res.status(500).json({ message: "Internal server error" });
  }
})

router.put('/:id', protectRoute, async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;

    // get field requests
    const {title, description, status, dueDate, category_id} = req.body;

    // find task
    const task = await Task.findOne({
      where: {
        id: taskId,
        userId
      }
    })

    if(!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    
  } catch (error) {
    
  }
})

export default router;