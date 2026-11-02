/**
 * Format relative time in Threads style (e.g. 2m, 3h, 4d, 2w)
 * @param {string|Date} dateInput
 * @returns {string} formatted relative time
 */
export function formatRelativeTime(dateInput) {
  if (!dateInput) return "";

  const date = new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "1m";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 52) {
    return `${diffInWeeks}w`;
  }

  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

/**
 * Format full date and time for post detail view (e.g. 14:30 · 29 thg 10, 2026)
 * @param {string|Date} dateInput
 * @returns {string} formatted full date
 */
export function formatFullDateTime(dateInput) {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${hours}:${minutes} · ${day}/${month}/${year}`;
}
