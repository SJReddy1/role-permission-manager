import React, { useEffect, useState } from "react";
import { Button, Box, Tab } from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import RoleTable from "./roleTable";
import UserTable from "./userTable";
import { jwtDecode } from "jwt-decode";  // To decode JWT token

const AdminDashboard = () => {
  const [value, setValue] = useState("1");
  const [roles, setRoles] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false); // To track if user is admin
  const navigate = useNavigate();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"}/api/roles`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Attach token if needed
          },
        }
      );

      const formattedRoles = response.data.map((role) => ({
        id: role._id,
        roleName: role.rolename,
        permissions: Object.keys(role.permissions || {}).filter(
          (perm) => role.permissions[perm]
        ),
      }));

      setRoles(formattedRoles);
    } catch (error) {
      console.error(
        "Error fetching roles:",
        error.response ? error.response.data : error.message
      );
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/"); // Redirect to login if no token
      return;
    }

    try {
      const decodedToken = jwtDecode(token); // Decode JWT token
      const isAdminRole = decodedToken?.role === "admin"; // Check if the user is an admin

      if (!isAdminRole) {
        navigate("/"); // Redirect if not an admin
      } else {
        setIsAdmin(true); // Set admin status
        fetchRoles(); // Fetch roles only if the user is admin
      }
    } catch (error) {
      console.error("Invalid token:", error);
      navigate("/"); // Redirect if the token is invalid
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/"); // Redirect to login after logout
  };

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" color="primary" onClick={handleLogout}>
          Log Out
        </Button>
      </div>

      {isAdmin && (
        <Box sx={{ width: "80%", typography: "body1", margin: "5rem auto" }}>
          <TabContext value={value}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <TabList onChange={handleChange} aria-label="admin tabs">
                <Tab label="User Management" value="1" />
                <Tab label="Role Management" value="2" />
              </TabList>
            </Box>
            <TabPanel value="1">
              <UserTable roles={roles} />
            </TabPanel>
            <TabPanel value="2">
              <RoleTable roles={roles} setRoles={setRoles} fetchRoles={fetchRoles} />
            </TabPanel>
          </TabContext>
        </Box>
      )}
    </div>
  );
};

export default AdminDashboard;
