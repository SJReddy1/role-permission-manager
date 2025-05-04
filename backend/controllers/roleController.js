const Role = require('../models/Role');

// Create a new role
exports.createRole = async (req, res) => {
    const { rolename, permissions } = req.body;
    try {
        const newRole = new Role({ rolename, permissions });
        await newRole.save();
        res.status(201).json(newRole);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get all roles
exports.getRoles = async (req, res) => {
    try {
        const roles = await Role.find();
        res.status(200).json(roles);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get role by ID
exports.getRoleById = async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }
        res.status(200).json(role);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Update role
exports.updateRole = async (req, res) => {
    const { rolename, permissions } = req.body;
    try {
        const role = await Role.findByIdAndUpdate(
            req.params.id,
            { rolename, permissions },
            { new: true }
        );
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }
        res.status(200).json(role);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete role
exports.deleteRole = async (req, res) => {
    try {
        const role = await Role.findByIdAndDelete(req.params.id);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }
        res.status(200).json({ message: 'Role successfully deleted' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
