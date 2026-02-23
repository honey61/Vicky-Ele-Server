const Product = require("../models/Product");

function escapeRegex(value = "") {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeMessage(message = "") {
  return String(message).toLowerCase().trim();
}

function extractKeywords(message = "") {
  const text = normalizeMessage(message);
  const raw = text.split(/[^a-z0-9]+/).filter(Boolean);
  const stopWords = new Set([
    "a",
    "an",
    "the",
    "i",
    "we",
    "you",
    "is",
    "are",
    "for",
    "to",
    "of",
    "in",
    "on",
    "with",
    "and",
    "or",
    "my",
    "your",
    "want",
    "need",
    "show",
    "me",
    "any",
    "give",
    "best",
    "good",
    "find"
  ]);

  return raw.filter((word) => word.length > 2 && !stopWords.has(word));
}

function toProductLine(product) {
  const parts = [
    product.name,
    product.modelName ? `(${product.modelName})` : "",
    `Type: ${product.type}`,
    `Price: Rs ${product.price}`,
    `MRP: Rs ${product.mrp}`,
    product.discount ? `Discount: ${product.discount}%` : "",
    product.capacity ? `Capacity: ${product.capacity}` : "",
    product.warranty ? `Warranty: ${product.warranty}` : "",
    product.rank ? `Rank: ${product.rank}` : ""
  ].filter(Boolean);

  return `- ${parts.join(" | ")}`;
}

async function fetchRelevantProducts(message, limit = 6) {
  const keywords = extractKeywords(message);

  if (!keywords.length) {
    return [];
  }

  const conditions = keywords.map((keyword) => {
    const regex = new RegExp(escapeRegex(keyword), "i");
    return {
      $or: [
        { name: regex },
        { modelName: regex },
        { type: regex },
        { capacity: regex },
        { description: regex },
        { detailDescription: regex }
      ]
    };
  });

  const products = await Product.find({ $or: conditions })
    .sort({ isPopular: -1, createdAt: -1 })
    .limit(limit)
    .select("name modelName type price mrp discount capacity warranty rank description detailDescription")
    .lean();

  return products;
}

async function getMcpContext(message, limit = 6) {
  const matchedProducts = await fetchRelevantProducts(message, limit);

  if (!matchedProducts.length) {
    return {
      found: false,
      contextText: "No exact product matches found in database for this question.",
      products: []
    };
  }

  return {
    found: true,
    contextText: matchedProducts.map(toProductLine).join("\n"),
    products: matchedProducts
  };
}

module.exports = {
  getMcpContext
};
