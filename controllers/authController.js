const prisma = require("../prisma/prisma");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const getResetToken = require("../utils/getResetToken");
const {sendEmail} = require("../utils/sendEmail");

// @desc User registration
// @route POST /auth
// @access Public
const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const duplicate = await prisma.user.findFirst({
    where: {
      OR: [
        {
          username: {
            equals: username,
            mode: "insensitive",
          },
        },
        {
          email: {
            equals: email,
            mode: "insensitive",
          },
        },
      ],
    },
  });

  if (duplicate) {
    return res
      .status(400)
      .json({ message: "Username or email already exists" });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username: username,
      email: email,
      password: hashPassword,
      name: "user_" + username,
    },
  });

  if (user) {
    return res.json({ message: `new user ${user.username} created` });
  } else {
    return res.status(400).json({ message: "Invalid user data received" });
  }
});

// @desc Login
// route POST /auth
// @access Public
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!password || !username) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const isEmail = username.includes("@");

  let foundUser = isEmail
    ? await prisma.user.findUnique({
        where: {
          email: username,
        },
      })
    : await prisma.user.findUnique({
        where: {
          username: username,
        },
      });

  if (!foundUser) {
    return res.status(400).json({ message: `user ${username} does not exist` });
  }

  const match = await bcrypt.compare(password, foundUser.password);

  if (!match) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const accessToken = jwt.sign(
    {
      UserInfo: {
        username: foundUser.username,
        email: foundUser.email,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    {
      UserInfo: {
        username: foundUser.username,
        email: foundUser.email,
      },
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  // create secure cookie
  res.cookie("jwt", refreshToken, {
    httpOnly: true, // only accessible by server
    secure: true, // only accessible by https
    sameSite: "None", // cross site cookie
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ accessToken });
});

// @desc Refresh
// @route GET /auth/refresh
// @access Public
const refresh = asyncHandler(async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    return res.status(400).json({ message: "unauthorized" });
  }

  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    asyncHandler(async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "forbidden" });
      }

      const foundUser = await prisma.user.findUnique({
        where: {
          username: decoded.UserInfo.username,
        },
      });

      if (!foundUser) {
        return res.status(401).json({ message: "unauthorized" });
      }

      const accessToken = jwt.sign(
        {
          UserInfo: {
            username: foundUser.username,
            email: foundUser.email,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      res.json({ accessToken });
    })
  );
});

// @desc Logout
// @route POST /auth/logout
// @access Public
const logout = asyncHandler(async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    return res.sendStatus(204);
  }

  res.clearCookie("jwt", { httpOnly: true, secure: true, sameSite: "None" });

  res.json({ message: "logout" });
});

// @desc Forgot Password
// @route POST /auth/forgot-password
// @access Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "email is required" });
  }

  const foundUser = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (!foundUser) {
    return res.status(400).json({ message: `user with ${email} not found` });
  }

  const resetToken = await getResetToken(foundUser);

  const url = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const message = `Click the link to reset the password ${url}`;

  await sendEmail(foundUser.email, "Password Reset Link", message);

  res.json({ message: `Reset link has been sent to ${email}` });
});

// @desc Reset Password
// @route PUT /auth/reset-password
// @access Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;

  if (!token || token.length !== 40)
    return res.status(400).json({ message: "Invalid token" });

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const foundUser = await prisma.user.findFirst({
    where: {
      resetToken: resetPasswordToken,
    },
  });

  if (!foundUser) {
    return res.status(400).json({ message: "Invalid token" });
  }

  if (foundUser.resetTokenExpiry < Date.now()) {
    return res.status(400).json({ message: "Token expired" });
  }

  const { password } = req.body;
  await prisma.user.update({
    where: {
      email: foundUser.email,
    },
    data: {
      password: await bcrypt.hash(password, 10),
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  return res.json({ message: "password reset successful" });
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
};

