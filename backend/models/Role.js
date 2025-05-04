const mongoose = require('mongoose');

// Define Role schema
const roleSchema = new mongoose.Schema(
  {
    rolename: {
      type: String,
      required: [true, "Role name is required"],
      unique: true,
      trim: true,
    },
    permissions: {
      read: { type: Boolean, default: false },
      write: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
  },
  { timestamps: true } // Optional: adds createdAt and updatedAt
);

// Ensure unique index is applied correctly
roleSchema.index({ rolename: 1 }, { unique: true });

module.exports = mongoose.model('Role', roleSchema);
