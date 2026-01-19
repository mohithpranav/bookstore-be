import asyncHandler from "../utils/async-handler.js";
import Item from "../models/Item.js";

const getBooksPaginated = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = 12;
  const skip = (page - 1) * limit;

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

  const formattedBooks = books.map((book) => ({
    id: book._id,
    name: book.name,
    author: book.author,
    price: book.price,
    image: book.image,
    ratingCount: book.rating || 0,
  }));

  res.status(200).json({
    success: true,
    page,
    count: formattedBooks.length, // books in this page (max 12)
    total: totalBooks, // total books in DB
    totalPages: Math.ceil(totalBooks / limit),
    books: formattedBooks,
  });
});

const getBookDetails = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const book = await Item.findById(bookId).populate("comments.userId", "name");

  if (!book) {
    res.status(404);
    throw new Error("Book not found");
  }

  res.status(200).json({
    success: true,
    book,
  });
});

export { getBooksPaginated, getBookDetails };
