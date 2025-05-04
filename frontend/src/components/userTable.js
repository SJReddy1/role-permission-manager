import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
} from "@mui/material";

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [editUser, setEditUser] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"}/api/users`
      );
      console.log("Fetched users:", response.data); // 👈 Logs response from backend
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"}/api/roles`
      );
      setRoles(response.data);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  useEffect(() => {
    const isValid =
      editUser?.name?.trim() &&
      emailRegex.test(editUser?.email || "") &&
      editUser?.role &&
      editUser?.status &&
      (isCreating ? editUser?.password : true);
    setIsFormValid(isValid);
  }, [editUser, isCreating]);

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleCreateNewUser = () => {
    setEditUser({
      name: "",
      email: "",
      role: "user",
      status: "Active",
      password: "",
      permissions: [],
    });
    setIsCreating(true);
    setIsDialogOpen(true);
  };

  const handleEdit = (user) => {
    // Set the edit user state with the correct user details
    setEditUser({ ...user });
    setIsCreating(false); // Indicates we are editing, not creating
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditUser(null);
    setIsCreating(false);
  };

  const handleSaveChanges = async () => {
    const { name, email, role, status, password, id } = editUser || {};
  
    // Ensure that the ID is set before proceeding
    if (!id) {
      console.error("Error: User ID is missing");
      return;
    }
  
    const selectedRole = roles.find((r) => r.rolename === role);
    const permissions = selectedRole?.permissions || [];
    const userPayload = { name, email, role, status, permissions };
  
    try {
      if (isCreating) {
        userPayload.password = password;
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"}/api/users`,
          userPayload
        );
        setUsers((prev) => [...prev, response.data]);
      } else {
        if (password?.trim()) {
          userPayload.password = password;
        }
        const response = await axios.put(
          `${process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"}/api/users/${id}`,
          userPayload
        );
        setUsers((prev) =>
          prev.map((u) => (u.id === response.data.id ? response.data : u))
        );
      }
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving user:", error.response?.data || error.message);
    }
  };

  const handleDelete = async (userId) => {
    console.log(userId);
    if (!userId) return;
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"}/api/users/${userId}`
      );
      if (response.status === 200) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      } else {
        console.error("Failed to delete user:", response.data);
      }
    } catch (error) {
      console.error("Error deleting user:", error.response?.data || error.message);
    }
  };

  const handleEditChange = (field, value) => {
    setEditUser((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <TextField
          label="Search by Name or Email"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ width: "60%" }}
        />
        <Button
          variant="contained"
          onClick={handleCreateNewUser}
          sx={{
            backgroundColor: "#3f51b5",
            "&:hover": { backgroundColor: "#303f9f" },
            textTransform: "capitalize",
            borderRadius: "5px",
          }}
        >
          Create New User
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "wheat" }}>
              <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Role</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedUsers.length > 0 ? (
              displayedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.status}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleEdit(user)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDelete(user.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ fontStyle: "italic" }}>
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredUsers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(+e.target.value);
          setPage(0);
        }}
      />

      <Dialog open={isDialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ backgroundColor: "#3f51b5", color: "white" }}>
          {isCreating ? "Create New User" : "Edit User"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={editUser?.name || ""}
            fullWidth
            margin="normal"
            onChange={(e) => handleEditChange("name", e.target.value)}
          />
          <TextField
            label="Email"
            value={editUser?.email || ""}
            fullWidth
            margin="normal"
            onChange={(e) => handleEditChange("email", e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            value={editUser?.password || ""}
            fullWidth
            margin="normal"
            onChange={(e) => handleEditChange("password", e.target.value)}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={editUser?.role || ""}
              onChange={(e) => handleEditChange("role", e.target.value)}
              label="Role"
            >
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.rolename}>
                  {role.rolename}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={editUser?.status || ""}
              onChange={(e) => handleEditChange("status", e.target.value)}
              label="Status"
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveChanges}
            disabled={!isFormValid}
            color="primary"
            variant="contained"
          >
            {isCreating ? "Create" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserTable;
