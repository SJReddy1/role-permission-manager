import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
} from "@mui/material";
import React, { useState } from "react";
import axios from "axios";

// Permissions list
const permissionsList = ["read", "write", "delete"];

const RoleTable = ({ roles, setRoles }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [editRole, setEditRole] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const API_BASE = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  const filteredRoles = roles.filter((role) =>
    role.roleName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleEdit = (role) => {
    setEditRole({ ...role });
    setIsCreating(false);
    setIsDialogOpen(true);
  };

  const handleCreateNewRole = () => {
    setEditRole({ roleName: "", permissions: [] });
    setIsCreating(true);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditRole(null);
    setIsCreating(false);
  };

  const allPermissions = ["read", "write", "delete"];

  const handleSaveChanges = async () => {
    const permissionsObject = {};
    allPermissions.forEach((permission) => {
      permissionsObject[permission] = editRole.permissions.includes(permission);
    });

    const roleData = {
      rolename: editRole.roleName,
      permissions: permissionsObject,
    };

    try {
      if (isCreating) {
        const response = await axios.post(`${API_BASE}/api/roles`, roleData);
        const createdRole = response.data;

        const updated = {
          roleName: createdRole.rolename,
          id: createdRole._id,
          permissions: Object.keys(createdRole.permissions).filter(
            (key) => createdRole.permissions[key]
          ),
        };
        setRoles((prevRoles) => [...prevRoles, updated]);
      } else {
        const response = await axios.put(
          `${API_BASE}/api/roles/${editRole.id}`,
          roleData
        );
        const updatedRoleData = response.data;

        const updated = {
          roleName: updatedRoleData.rolename,
          id: updatedRoleData._id,
          permissions: Object.keys(updatedRoleData.permissions).filter(
            (key) => updatedRoleData.permissions[key]
          ),
        };
        setRoles((prevRoles) =>
          prevRoles.map((role) =>
            role.id === updated.id ? updated : role
          )
        );
      }
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving role:", error);
    }
  };

  const handleDelete = async (roleId) => {
    try {
      await axios.delete(`${API_BASE}/api/roles/${roleId}`);
      setRoles((prevRoles) => prevRoles.filter((role) => role.id !== roleId));
    } catch (error) {
      console.error("Error deleting role:", error);
    }
  };

  const handleEditChange = (field, value) => {
    setEditRole((prev) => ({ ...prev, [field]: value }));
  };

  const handlePermissionToggle = (permission) => {
    setEditRole((prev) => {
      const permissions = prev.permissions.includes(permission)
        ? prev.permissions.filter((perm) => perm !== permission)
        : [...prev.permissions, permission];
      return { ...prev, permissions };
    });
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" marginBottom={2}>
        <TextField
          label="Search by Role Name"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateNewRole}
        >
          Add Role
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: "wheat" }}>
              <TableCell>Role Name</TableCell>
              <TableCell>Permissions</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRoles
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((role) => (
                <TableRow key={role.id}>
                  <TableCell>{role.roleName}</TableCell>
                  <TableCell>
                    {permissionsList.map((permission) => (
                      <Checkbox
                        key={permission}
                        checked={role.permissions.includes(permission)}
                        disabled
                      />
                    ))}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleEdit(role)}
                      style={{ marginRight: "8px" }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDelete(role.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            {filteredRoles.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No roles found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredRoles.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{isCreating ? "Add Role" : "Edit Role"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Role Name"
            value={editRole?.roleName || ""}
            fullWidth
            margin="normal"
            onChange={(e) => handleEditChange("roleName", e.target.value)}
          />
          <Box marginTop={2}>
            <label>Permissions:</label>
            <Box>
              {permissionsList.map((permission) => (
                <Box key={permission} display="inline-block" marginRight={2}>
                  <Checkbox
                    checked={editRole?.permissions.includes(permission)}
                    onChange={() => handlePermissionToggle(permission)}
                  />
                  {permission}
                </Box>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleSaveChanges}
            color="primary"
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoleTable;
