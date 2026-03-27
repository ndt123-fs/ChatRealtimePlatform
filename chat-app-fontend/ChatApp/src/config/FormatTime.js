export function formatTime(date) {
  if (!date) return "";

  const d = new Date(date);

  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}