import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Task = sequelize.define("Task", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  status: {
    type: DataTypes.ENUM("pending", "in_progress", "completed"),
    allowNull: false,
    defaultValue: "pending",
  },

  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: "due_date",
  },

  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: "category_id",
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: "user_id",
  },
});



export default Task;