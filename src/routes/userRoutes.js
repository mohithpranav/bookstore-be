import { Router } from "express";
import { signin, signup } from "../controller/authController.js";
import { getBooksPaginated, getBookDetails } from "../services/getItems.js";
import {
  addAdress,
  deleteAddress,
  updateUserProfile,
  getUserProfile,
  updateAddress,
  getAddresses,
} from "../services/userService.js";
import {
  addCartItem,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartItems,
} from "../services/cartService.js";
import { placeOrder, getOrder, confirmOrder } from "../services/orderService.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// auth routes
router.post("/signup", signup);
router.post("/signin", signin);

// user profile routes
router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);

// get Books
router.get("/books", authMiddleware, getBooksPaginated);
router.get("/books/:bookId", authMiddleware, getBookDetails);

// address routes
router.post("/address", authMiddleware, addAdress);
router.put("/address/:addressId", authMiddleware, updateAddress);
router.delete("/address/:addressId", authMiddleware, deleteAddress);
router.get("/address", authMiddleware, getAddresses);

// cart routes
router.get("/cart", authMiddleware, getCartItems);
router.post("/cart", authMiddleware, addCartItem);
router.put("/cart", authMiddleware, updateCartItem);
router.delete("/cart/:itemId", authMiddleware, removeFromCart);
router.delete("/cart", authMiddleware, clearCart);

// order routes
router.post("/order", authMiddleware, placeOrder);
router.get("/order/:orderId", authMiddleware, getOrder);
router.put("/order/:orderId/confirm", authMiddleware, confirmOrder);

export default router;
