import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {jwtDecode} from "jwt-decode"; // ✅ install with: npm install jwt-decode

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"}/api/auth/login`,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

     
    const { token, user } = data; // Assuming `data` contains both token and user object
    const decoded = jwtDecode(token);

    // Storing the entire user object in localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user)); // Store entire user object

    console.log(user);

      if (decoded.role === "admin") {
        navigate("/admindashboard");
      } else {
        navigate("/userdashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpRedirect = () => {
    navigate("/register");
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
        <Box>
          <Typography variant="h4" gutterBottom align="center" color="primary">
            Login to Dashboard
          </Typography>
          <TextField label="Email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField label="Password" type="password" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} sx={{ mt: 2 }} />
          {error && <Typography color="error">{error}</Typography>}
          <Button variant="contained" onClick={handleSubmit} disabled={loading} fullWidth sx={{ mt: 2 }}>
            {loading ? "Logging in..." : "Submit"}
          </Button>
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Don't have an account?{" "}
            <Button variant="text" onClick={handleSignUpRedirect}>
              Sign Up
            </Button>
          </Typography>
        </Box>
      </div>
    </div>
  );
};

export default Login;
