import { createBrowserRouter } from "react-router-dom";
import NotFound from "./views/NotFound";
import Login from "./views/Login";
import DefaultLayout from "./layout/DefaultLayout";
import Tasks from "./views/Tasks";
import TaskForm from "./views/TaskForm";
import CategoryForm from "./views/CategoryForm";

const router = createBrowserRouter([
  {
    path: '/',
    element: <DefaultLayout />,
    children: [
      {
        path: '/tasks',
        element: <Tasks />
      },
        {
            path: '/tasks/new',
            element: <TaskForm key={"taskCreate"} />
        },
        {
            path: '/tasks/:id',
            element: <TaskForm key="taskUpdate" />
        },
        { 
          path: '/categories/new', 
          element: <CategoryForm /> 
        },
    ]
  },
  {
    path: '/login',
    element: <Login />
  },

  {
    path: '*',
    element: <NotFound />
  },
]);

export default router;