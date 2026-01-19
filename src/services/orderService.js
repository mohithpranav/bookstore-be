import Cart from "../models/Cart.js";
import Item from "../models/Item.js";
import Order from "../models/Order.js";
import Address from "../models/Address.js";

const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId, expectedTotal } = req.body;

    // 1. Get cart
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let totalAmount = 0;
    const orderItems = [];

    // 2. Calculate total
    for (let item of cart.items) {
      const product = await Item.findById(item.itemId);
      if (!product) continue;

      totalAmount += product.price * item.quantity;

      orderItems.push({
        itemId: product._id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // 3. Validate price if expectedTotal is provided
    if (expectedTotal && Math.abs(totalAmount - expectedTotal) > 0.01) {
      return res.status(400).json({ 
        message: "Price mismatch. Please refresh and try again.",
        backendTotal: totalAmount,
        frontendTotal: expectedTotal
      });
    }

    // 4. Create order with PENDING status
    const order = new Order({
      userId,
      items: orderItems,
      totalPrice: totalAmount,
      addressId,
      status: "PENDING",
    });

    // 5. Save order
    await order.save();

    // 6. Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      message: "Order created successfully",
      orderId: order._id,
      order,
    });
  } catch (err) {
    console.error("Order error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, userId })
      .populate("items.itemId")
      .populate("addressId");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (err) {
    console.error("Get order error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const confirmOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = "CONFIRMED";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order confirmed successfully",
      order,
    });
    console.log("Order confirmed:", orderId);
  } catch (err) {
    console.error("Confirm order error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get all orders for a user
const getAllOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ userId })
      .populate("items.itemId")
      .populate("addressId")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error("Get all orders error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export { placeOrder, getOrder, confirmOrder, getAllOrders };
