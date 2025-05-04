import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ requiredRole, children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    // If no token is found, redirect to login page
    return <Navigate to="/" />;
  }

  try {
    const decoded = jwtDecode(token);
    const role = decoded.role;

    if (role !== requiredRole) {
      // If the user's role doesn't match the required role, redirect accordingly
      return <Navigate to={`/${role}dashboard`} />;
    }

    return children; // Allow access to the protected route
  } catch (err) {
    localStorage.clear(); // If token is invalid or expired, clear it
    return <Navigate to="/" />;
  }
};

export default ProtectedRoute;