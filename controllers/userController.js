const prisma = require("../prisma/prisma");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

// @desc get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
    },
  });
  if (!users.length) {
    return res.status(404).json({ message: "No users found" });
  }
  return res.json(users);
});


module.exports = {
  getAllUsers,
};
