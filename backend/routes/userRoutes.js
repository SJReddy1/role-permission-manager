const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");


router.post("/", userController.createUser);

router.get("/", userController.getUsers); // Get all users

router.get("/:id", userController.getUserById); // Get user by ID

router.put("/:id", userController.updateUser); // Update user

router.delete("/:id", userController.deleteUser); // Delete user



module.exports = router;
