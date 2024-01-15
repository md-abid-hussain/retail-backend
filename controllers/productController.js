const prisma = require("../prisma/prisma");
const asyncHandler = require("express-async-handler");

// @desc    Fetch all products
// @route   GET /products
// @access  Private
const getAllProducts = asyncHandler(async (req, res) => {
  const products = await prisma.product.findMany();
  if (!products.length) {
    return res.status(404).json({ message: "No product found" });
  }
  res.json(products);
});

// @desc    Create a product
// @route   POST /products
// @access  Private
const createProduct = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    price,
    rating,
    category,
    reviews,
    quantity,
    thumbnail,
    images,
  } = req.body;

  if (
    !title ||
    !description ||
    !price ||
    !rating ||
    !category ||
    !reviews ||
    !quantity ||
    !thumbnail ||
    !Array.isArray(images) ||
    !images.length
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const duplicateProduct = await prisma.product.findUnique({
    where: {
      title: title,
    },
  });

  if (duplicateProduct) {
    return res.status(400).json({ message: "Product already exists" });
  }

  const product = await prisma.product.create({
    data: {
      title,
      description,
      price,
      rating,
      category,
      reviews,
      quantity,
      thumbnail,
      images,
    },
  });

  if (product) {
    return res.json({ message: `new product ${product.title} created` });
  } else {
    return res.status(400).json({ message: "Invalid product data" });
  }
});

module.exports = { getAllProducts, createProduct };
