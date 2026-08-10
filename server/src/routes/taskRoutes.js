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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

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
    const taskId = req.params.id;
    const userId = req.user.id;

    const {
      title,
      description,
      status,
      dueDate,
      categoryId
    } = req.body;

    // Find task belonging to logged-in user
    const task = await Task.findOne({
      where: {
        id: taskId,
        userId
      }
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    // Validate and update title
    if (title !== undefined) {
      if (title.trim() === "") {
        return res.status(400).json({
          message: "Title cannot be empty"
        });
      }

      task.title = title;
    }

    // Update description
    if (description !== undefined) {
      task.description = description;
    }

    // Validate and update status
    if (status !== undefined) {
      const validStatuses = [
        "pending",
        "in_progress",
        "completed"
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid status"
        });
      }

      task.status = status;
    }

    // Update due date
    if (dueDate !== undefined) {
      task.dueDate = dueDate;
    }

    // Validate category ownership and update category
    if (categoryId !== undefined) {
      const category = await Category.findOne({
        where: {
          id: categoryId,
          userId
        }
      });

      if (!category) {
        return res.status(404).json({
          message: "Category not found"
        });
      }

      task.categoryId = categoryId;
    }

    await task.save();

    return res.status(200).json({
      task
    });

  } catch (error) {
    console.log("Error updating task", error);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
});

router.delete('/:id', protectRoute, async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;

    const task = await Task.findOne({
      where: {
        id: taskId,
        userId
      }
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    await task.destroy();

    return res.status(200).json({
      message: "Task deleted successfully"
    });

  } catch (error) {
    console.log("Error deleting task", error);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
});

export default router;