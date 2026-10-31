const DAY_IN_MS = 24 * 60 * 60 * 1000;

// "2026-11-05T00:00:00.000Z" -> "Nov 5, 2026"
export const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

export const formatPrice = (amount) => `${Number(amount).toFixed(0)} JD`;

// Today's date as "YYYY-MM-DD" in the user's local time (for <input type="date">)
export const todayString = () => {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
};

// Number of rental days between two "YYYY-MM-DD" strings
export const daysBetween = (start, end) => {
  if (!start || !end) return 0;
  const diff = (new Date(end) - new Date(start)) / DAY_IN_MS;
  return diff > 0 ? Math.ceil(diff) : 0;
};

export const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);
