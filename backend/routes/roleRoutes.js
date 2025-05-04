const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');

// Create a new role
router.post('/', roleController.createRole);

// Get all roles
router.get('/', roleController.getRoles); // Updated to fetch all roles

// Get role by ID
router.get('/:id', roleController.getRoleById);  // Get role by ID

// Update role
router.put('/:id', roleController.updateRole);  // Update role

// Delete role
router.delete('/:id', roleController.deleteRole);  // Delete role

module.exports = router;
