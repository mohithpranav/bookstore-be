import asyncHandler from "../utils/async-handler.js";
import User from "../models/User.js";
import Address from "../models/Address.js";
import bcrypt from "bcrypt";

const addAdress = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { fullName, mobileNo, street, city, state, pincode, type } = req.body;

  if (!fullName || !mobileNo || !street || !city || !state || !pincode) {
    res.status(400);
    throw new Error("All address fields are required");
  }

  const newAddress = await Address.create({
    userId,
    fullName,
    mobileNo,
    street,
    city,
    state,
    pincode,
    type,
  });

  res.status(201).json({
    success: true,
    message: "Address added successfully",
    newAddress,
  });
});

const deleteAddress = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { addressId } = req.params;

  const address = await Address.findOne({
    _id: addressId,
    userId,
  });

  if (!address) {
    res.status(404);
    throw new Error("Address not found");
  }

  await address.deleteOne();

  res.status(200).json({
    success: true,
    message: "Address deleted successfully",
  });
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { name, email, mobileNo, password } = req.body;
  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  user.name = name || user.name;
  user.email = email || user.email;
  user.mobileNo = mobileNo || user.mobileNo;
  if (password) {
    user.password = await bcrypt.hash(password, 10);
  }
  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      mobileNo: user.mobileNo,
    },
  });
});

const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const user = await User.findById(userId).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const addresses = await Address.find({ userId });

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      mobileNo: user.mobileNo,
    },
    addresses,
  });
});

const updateAddress = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { addressId } = req.params;
  const { fullName, mobileNo, street, city, state, pincode, type } = req.body;

  const addressDoc = await Address.findOne({ _id: addressId, userId });

  if (!addressDoc) {
    res.status(404);
    throw new Error("Address not found");
  }

  addressDoc.fullName = fullName || addressDoc.fullName;
  addressDoc.mobileNo = mobileNo || addressDoc.mobileNo;
  addressDoc.street = street || addressDoc.street;
  addressDoc.city = city || addressDoc.city;
  addressDoc.state = state || addressDoc.state;
  addressDoc.pincode = pincode || addressDoc.pincode;
  addressDoc.type = type || addressDoc.type;

  await addressDoc.save();

  res.status(200).json({
    success: true,
    message: "Address updated successfully",
    address: addressDoc,
  });
});

const getAddresses = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const addresses = await Address.find({ userId });

  if (!addresses) {
    res.status(404);
    throw new Error("No addresses found");
  }

  res.status(200).json({
    success: true,
    addresses,
  });
});

export {
  addAdress,
  deleteAddress,
  updateUserProfile,
  getUserProfile,
  updateAddress,
  getAddresses,
};
