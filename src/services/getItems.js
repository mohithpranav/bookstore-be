import asyncHandler from "../utils/async-handler.js";
import Item from "../models/Item.js";
import cacheService from "../utils/cache.js";

const getBooksPaginated = asyncHandler(async (req, res) => {
  const page = Number(req.query.page);
  const limit = 12;
  const skip = (page - 1) * limit;

  const cacheKey = `books:page:${page}`;

  // Try to return cached response first
  try {
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, ...cached });
    }
  } catch (err) {
    console.error("Cache get error:", err);
  }

  const books = await Item.find(
    {},
    {
      name: 1,
      author: 1,
      price: 1,
      image: 1,
      rating: 1,
    },
  )
    .skip(skip)
    .limit(limit);

  const totalBooks = await Item.countDocuments();
  5;

  const formattedBooks = books.map((book) => ({
    id: book._id,
    name: book.name,
    author: book.author,
    price: book.price,
    image: book.image,
    ratingCount: book.rating || 0,
  }));

  const responsePayload = {
    page,
    count: formattedBooks.length, // books in this page (max 12)
    total: totalBooks, // total books in DB
    totalPages: Math.ceil(totalBooks / limit),
    books: formattedBooks,
  };

  // Cache the response for a short period (e.g., 5 minutes)
  try {
    await cacheService.set(cacheKey, responsePayload, 300);
  } catch (err) {
    console.error("Cache set error:", err);
  }

  res.status(200).json({ success: true, ...responsePayload });
});

const getBookDetails = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const cacheKey = `book:${bookId}`;

  try {
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, book: cached });
    }
  } catch (err) {
    console.error("Cache get error:", err);
  }

  const book = await Item.findById(bookId).populate("comments.userId", "name");

  if (!book) {
    res.status(404);
    throw new Error("Book not found");
  }

  // Convert to plain object before caching to avoid mongoose document issues
  const bookObj = book.toObject ? book.toObject() : JSON.parse(JSON.stringify(book));

  try {
    await cacheService.set(cacheKey, bookObj, 3600); // cache for 1 hour
  } catch (err) {
    console.error("Cache set error:", err);
  }

  res.status(200).json({
    success: true,
    book: bookObj,
  });
});

export { getBooksPaginated, getBookDetails };
