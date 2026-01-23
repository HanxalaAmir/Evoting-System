// Formats dates to "Jan 1, 2024"
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Formats time to "09:00 AM"
export const formatTime = (timeString) => {
  if (!timeString) return '';
  // Check if it's already a time string like "09:00" or a full ISO date
  if (timeString.includes('T')) {
    return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return timeString;
};

// Calculates percentage safely (Prevents NaN/Infinity)
export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return ((value / total) * 100).toFixed(1);
};

// Truncates long text (e.g., descriptions)
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};