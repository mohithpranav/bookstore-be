import asyncHandler from "../utils/async-handler.js";
import Cart from "../models/Cart.js";

const addCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, items: [] });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.itemId.toString() === productId,
  );
  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({ itemId: productId, quantity });
  }
  await cart.save();
  res.status(200).json({
    success: true,
    message: "Item added to cart successfully",
    cart,
  });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { itemId, quantity } = req.body;

  if (quantity < 1) {
    res.status(400);
    throw new Error("Quantity must be at least 1");
  }

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  const item = cart.items.find((item) => item.itemId.toString() === itemId);

  if (!item) {
    res.status(404);
    throw new Error("Item not found in cart");
  }

  item.quantity = quantity;
  await cart.save();

  res.status(200).json({
    success: true,
    message: "Cart updated",
    cart,
  });
});

const removeFromCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { itemId } = req.params;

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  cart.items = cart.items.filter((item) => item.itemId.toString() !== itemId);

  await cart.save();

  res.status(200).json({
    success: true,
    message: "Item removed from cart",
    cart,
  });
});

const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  cart.items = [];
  await cart.save();

  res.status(200).json({
    success: true,
    message: "Cart cleared",
  });
});

const getCartItems = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const cart = await Cart.findOne({ userId }).populate("items.itemId");
  if (!cart) {
    return res.status(200).json({
      success: true,
      items: [],
    });
  }
  res.status(200).json({
    success: true,
    items: cart.items,
  });
});

export { addCartItem, updateCartItem, removeFromCart, clearCart, getCartItems };
