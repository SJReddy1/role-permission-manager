import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./register.css";

const Register = () => {
  const [name, setName] = useState(""); // ✅ Added name state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminRoute = location.pathname === "/admin/register";

  const validateForm = () => {
    if (!name || !email || !password) {
      setError("Name, email, and password are required.");
      return false;
    }
    if (isAdminRoute && !adminKey) {
      setError("Admin key is required for admin registration.");
      return false;
    }
    setError(""); // Clear any previous errors
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const payload = { name, email, password }; // ✅ Include name in payload
      if (isAdminRoute) {
        payload.adminKey = adminKey;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"}/api/auth/register`,
        payload
      );

      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  const handleSwitchRoute = () => {
    navigate(isAdminRoute ? "/register" : "/admin/register");
  };

  return (
    <div
      style={{
        backgroundColor: "#f0f4f8",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          borderRadius: "8px",
          padding: "2rem",
          backgroundColor: "#ffffff",
          maxWidth: "30rem",
          width: "100%",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Box sx={{ width: "100%", typography: "body1" }}>
          <Typography variant="h3" gutterBottom align="center" color="primary">
            {isAdminRoute ? "Admin Registration" : "Create a New Account"}
          </Typography>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* ✅ Name field */}
            <TextField
              id="name"
              label="Name"
              variant="outlined"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{
                borderRadius: "8px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
              }}
            />
            <TextField
              id="email"
              label="Email"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                borderRadius: "8px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
              }}
            />
            <TextField
              id="password"
              label="Password"
              variant="outlined"
              fullWidth
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                borderRadius: "8px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
              }}
            />
            {isAdminRoute && (
              <TextField
                id="adminkey"
                label="Admin Key"
                variant="outlined"
                fullWidth
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                sx={{
                  borderRadius: "8px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  },
                }}
              />
            )}
            {error && <Typography color="error">{error}</Typography>}
            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{
                backgroundColor: "#1976d2",
                "&:hover": {
                  backgroundColor: "#1565c0",
                },
              }}
            >
              Register
            </Button>

            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <Typography variant="body2">
                {isAdminRoute ? "Registering as admin? " : "Not an admin? "}
                <Button
                  variant="text"
                  color="primary"
                  onClick={handleSwitchRoute}
                >
                  {isAdminRoute ? "Register as User" : "Register as Admin"}
                </Button>
              </Typography>
            </div>
          </div>
        </Box>
      </div>
    </div>
  );
};

export default Register;
