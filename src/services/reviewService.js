import asyncHandler from "../utils/async-handler.js";
import Item from "../models/Item.js";
import Order from "../models/Order.js";

// Check if user can review a book (has ordered and confirmed)
const canUserReview = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { bookId } = req.params;

  // Find confirmed orders for this user containing this book
  const orders = await Order.find({
    userId,
    status: "CONFIRMED",
    "items.itemId": bookId,
  });

  res.status(200).json({
    canReview: orders.length > 0,
  });
});

// Add a review to a book
const addReview = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { bookId } = req.params;
  const { rating, comment } = req.body;

  // Check if user can review
  const orders = await Order.find({
    userId,
    status: "CONFIRMED",
    "items.itemId": bookId,
  });
  if (orders.length === 0) {
    res.status(403);
    throw new Error(
      "You can only review books you have purchased and received.",
    );
  }

  // Add review
  const book = await Item.findById(bookId);
  if (!book) {
    res.status(404);
    throw new Error("Book not found");
  }

  // Prevent duplicate review by same user
  const alreadyReviewed = book.comments.some(
    (c) => c.userId.toString() === userId,
  );
  if (alreadyReviewed) {
    res.status(400);
    throw new Error("You have already reviewed this book.");
  }

  book.comments.push({ userId, rating, comment });
  // Update average rating
  const ratings = book.comments.map((c) => c.rating);
  book.rating = ratings.length
    ? ratings.reduce((a, b) => a + b, 0) / ratings.length
    : rating;
  await book.save();

  res.status(201).json({ message: "Review added successfully" });
});

export { canUserReview, addReview };
