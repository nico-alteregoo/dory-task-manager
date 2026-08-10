import Task from "./Task.js";
import Category from "./Category.js";

Task.belongsTo(Category, {
  foreignKey: "categoryId",
});

Category.hasMany(Task, {
  foreignKey: "categoryId",
});

export {
  Task,
  Category
};