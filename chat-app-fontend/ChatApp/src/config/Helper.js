
// export function timeAgo(date) {
//   const now = new Date();
//   const past = new Date(date);
//   const secondsAgo = Math.floor((now - past) / 1000);

//   if (secondsAgo < 60) return `${secondsAgo} seconds ago`;
//   const minutesAgo = Math.floor(secondsAgo / 60);
//   if (minutesAgo < 60) return `${minutesAgo} minutes ago`;
//   const hoursAgo = Math.floor(minutesAgo / 60);
//   if (hoursAgo < 24) return `${hoursAgo} hours ago`;
//   const daysAgo = Math.floor(hoursAgo / 24);
//   if (daysAgo < 30) return `${daysAgo} days ago`;
//   const monthsAgo = Math.floor(daysAgo / 30);
//   if (monthsAgo < 12) return `${monthsAgo} months ago`;
//   const yearsAgo = Math.floor(monthsAgo / 12);
//   return `${yearsAgo} years ago`;
// }

// console.log(timeAgo("2023-12-01T14:00:00Z"));
export function timeAgo(date) {
  if (!date) return "";

  const now = new Date();
  const past = new Date(date);

  const seconds = Math.floor((now - past) / 1000);

  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds} seconds ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} days ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} months ago`;

  const years = Math.floor(months / 12);
  return `${years} years ago`;
}
