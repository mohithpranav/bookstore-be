import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import asyncHandler from "../utils/async-handler.js";
import User from "../models/User.js";

const signup = asyncHandler(async (req, res) => {
  const { name, password, email, mobileNo } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name: name,
    email,
    password: hashedPassword,
    mobileNo,
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      mobileNo: newUser.mobileNo,
    },
  });
});

const signin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    res.status(400);
    throw new Error("Invalid email or password");
  }
  const isMatch = await bcrypt.compare(password, existingUser.password);
  if (!isMatch) {
    res.status(400);
    throw new Error("Invalid email or password");
  }
  const token = jwt.sign(
    { id: existingUser._id, email: existingUser.email },
    process.env.JWT_SECRET,
    { expiresIn: "5h" },
  );

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: {
      id: existingUser._id,
      name: existingUser.name,
      email: existingUser.email,
      mobileNo: existingUser.mobileNo,
    },
  });
});

export { signup, signin };
