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
import { placeOrder, getOrder, confirmOrder, getAllOrders } from "../services/orderService.js";
import { canUserReview, addReview } from "../services/reviewService.js";
import authMiddleware from "../middleware/authMiddleware.js";
import passport from "passport";
import jwt from "jsonwebtoken";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

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
router.get("/orders", authMiddleware, getAllOrders);

// review routes
router.get("/books/:bookId/can-review", authMiddleware, canUserReview);
router.post("/books/:bookId/review", authMiddleware, addReview);

// OAuth routes
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${FRONTEND_URL}/?oauth=fail` }),
  (req, res) => {
    // user should be on req.user
    const user = req.user;
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "5h" });
    return res.redirect(`${FRONTEND_URL}/auth-callback?token=${token}`);
  },
);

router.get(
  "/auth/facebook",
  passport.authenticate("facebook", { scope: ["email"] }),
);

router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { session: false, failureRedirect: `${FRONTEND_URL}/?oauth=fail` }),
  (req, res) => {
    const user = req.user;
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "5h" });
    return res.redirect(`${FRONTEND_URL}/auth-callback?token=${token}`);
  },
);

export default router;
