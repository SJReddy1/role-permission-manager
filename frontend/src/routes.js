import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "./components/login";
import Register from "./components/register";
import AdminDashboard from "./components/adminDashboard";
import UserDashboard from "./components/userDashboard";
import ProtectedRoute from "./components/protectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/admin/register",
    element: <Register />,
  },
  {
    path: "/userdashboard",
    
    element:    <UserDashboard />,
      
    
  },
  {
    path: "/admindashboard",
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" />,
  },
]);