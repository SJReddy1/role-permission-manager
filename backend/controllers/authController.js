const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');

const ADMIN_KEY = process.env.ADMIN_KEY; // Admin registration key

// Ensure the 'admin' role exists in the system
const ensureAdminRoleExists = async () => {
  const adminRoleExists = await Role.findOne({ rolename: 'admin' });
  if (!adminRoleExists) {
    const adminRole = new Role({
      rolename: 'admin',
      permissions: { read: true, write: true, delete: true },
    });
    await adminRole.save();
    console.log("Admin role created in the system.");
  }
};

// Ensure the 'user' role exists in the system
const ensureUserRoleExists = async () => {
  const userRoleExists = await Role.findOne({ rolename: 'user' });
  if (!userRoleExists) {
    const userRole = new Role({
      rolename: 'user',
      permissions: { read: true, write: false, delete: false },
    });
    await userRole.save();
    console.log("User role created in the system.");
  }
};

// ✅ Corrected LOGIN function
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 2. Check status
    if (user.status === "Inactive") {
      return res.status(403).json({ message: "User is inactive! Please contact admin." });
    }

    // 3. Compare password using model method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // 4. Get permissions from role
    const role = await Role.findOne({ rolename: user.role });
    const permissions = role
      ? Object.keys(role.permissions).filter(key => role.permissions[key])
      : [];

    // 5. Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 6. Respond
    res.status(200).json({
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        permissions,
      },
      token,
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// LOGOUT (Client-side token removal)
const logout = (req, res) => {
  res.json({ message: "Logged out successfully" });
};

// REGISTER
const register = async (req, res) => {
  const { email, password, adminKey, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  try {
    await ensureAdminRoleExists();
    await ensureUserRoleExists();

    const role = adminKey === ADMIN_KEY ? "admin" : "user";

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const roleExists = await Role.findOne({ rolename: role });
    if (!roleExists) {
      return res.status(400).json({ message: `Role '${role}' does not exist` });
    }

    const newUser = new User({
      name,
      email,
      password, // will be hashed in model
      role,
      status: "Active",
    });

    newUser.permissions = Object.keys(roleExists.permissions).filter(key => roleExists.permissions[key]);

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        email: newUser.email,
        role: newUser.role,
        permissions: newUser.permissions,
      },
    });

  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({ message: "Error registering user" });
  }
};

module.exports = { login, logout, register };
