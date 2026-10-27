// Read ?page= and ?limit= from the query string and calculate how many documents to skip
const getPagination = (query, defaultLimit = 9) => {
  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit) || defaultLimit, 1), 50);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

// Information the frontend needs to draw the page buttons
const buildPageInfo = (total, page, limit) => ({
  total,
  page,
  limit,
  pages: Math.ceil(total / limit) || 1,
});

// Escape special characters so user text is safe to use inside a RegExp
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports = { getPagination, buildPageInfo, escapeRegex };
