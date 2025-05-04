const User = require("../models/User");
const Role = require('../models/Role');
const mongoose = require('mongoose');

// Helper to strip out sensitive fields and convert id to id
const sanitize = (userDoc) => {
  const { id, name, email, role, status, permissions } = userDoc;
  return {
    id: id.toString(),  // Convert id to string and return as id
    name,
    email,
    role,
    status,
    permissions
  };
};

//
// Create a new user
//
const createUser = async (req, res) => {
  const { name, email, role, status, password } = req.body;
  const selectedRole = await Role.findOne({ rolename: role });

  if (!selectedRole) {
    return res.status(400).json({ message: "Invalid role" });
  }

  // Construct the permissions array based on the selected role's permissions
  const permissions = [];
  if (selectedRole.permissions.read) permissions.push('read');
  if (selectedRole.permissions.write) permissions.push('write');
  if (selectedRole.permissions.delete) permissions.push('delete');

  const userPayload = {
    name,
    email,
    role,
    status,
    password,
    permissions,  // Ensure it's an array of strings
  };

  try {
    const newUser = new User(userPayload);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Error creating user", error: error.message });
  }
};


//
// Get all users
//
const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users.map(sanitize));
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
};

//
// Get user by ID
//
const getUserById = async (req, res) => {
  const { id } = req.params;

  // Log the ID to check if it's coming correctly
  console.log("Received ID:", id);

  try {
    // Ensure that the ID is valid (optional but recommended)
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Optionally sanitize sensitive data before sending the response
    const sanitizedUser = sanitize ? sanitize(user) : user; // Only sanitize if 'sanitize' function is defined

    // Send the user data (or sanitized data) as a response
    res.status(200).json(sanitizedUser);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Error fetching user", error: err.message });
  }
};



//
// Update user
//

const updateUser = async (req, res) => {
  const { name, email, password, role, status, permissions } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  // Check if the ID is valid
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update user properties
    user.name = name;
    user.email = email;
    user.role = role || user.role;
    user.status = status || user.status;

    // If permissions are provided, map them to the user
    if (permissions) {
      // Ensure that permissions are in the correct format (array of permission names)
      user.permissions = permissions;
    }

    // If the role is provided, find the associated role and update the user's role
    if (role) {
      const selectedRole = await Role.findOne({ rolename: role }).exec();
      if (!selectedRole) {
        return res.status(404).json({ message: "Role not found" });
      }

      // Optionally, map selectedRole permissions to the user's permissions
      if (selectedRole.permissions) {
        user.permissions = [
          ...(user.permissions || []),
          ...(selectedRole.permissions.read ? ['read'] : []),
          ...(selectedRole.permissions.write ? ['write'] : []),
          ...(selectedRole.permissions.delete ? ['delete'] : []),
        ];
      }
    }

    // If password changed, model’s pre-save will hash it
    if (password && password.trim()) {
      user.password = password;
    }

    // Save the updated user
    await user.save();

    res.json({
      message: "User updated successfully",
      user: sanitize(user),  // Assuming 'sanitize' is removing sensitive data like password
    });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Error updating user", error: err.message });
  }
};


//
// Delete User
//
const deleteUser = async (req, res) => {
  console.log('Received ID:', req.params.id); // Log the ID to check
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    // Use findByIdAndDelete instead of user.remove
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Error deleting user", error: err.message });
  }
};


module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
