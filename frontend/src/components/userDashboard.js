import React, { useEffect, useState } from "react";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Retrieve the user object from localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!token || !user) {
      localStorage.clear();
      navigate("/", { replace: true });
      return;
    }

    // If user data exists in localStorage, set it to state
    setUserData(user);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/"); // Redirect to login page
  };

  if (!userData) return null; // Optionally show a loading state here

  return (
    <div style={{ padding: "2rem", backgroundColor: "#f4f6f8" }}>
      <Box sx={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" color="error" onClick={handleLogout}>
          LogOut
        </Button>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, padding: "3rem" }}>
        <Card sx={{ boxShadow: 3, backgroundColor: "#e3f2fd", borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h3" gutterBottom color="primary">
              Welcome, {userData.name}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Email: {userData.email}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Role: {userData.role}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Permissions: {userData.permissions ? userData.permissions.join(", ") : "None"}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </div>
  );
};

export default UserDashboard;
