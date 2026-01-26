export const formatDate = (dateString) => {
  try {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);

    if (isNaN(date.getTime())) return 'Invalid Date';

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch (error) {
    return 'N/A';
  }
};

export const formatTime = (timeString) => {
  try {
    if (!timeString) return '';

    if (timeString.includes('T') || timeString.includes('-')) {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) return '';

      return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    }

    return timeString;
  } catch (error) {
    return timeString;
  }
};

export const calculatePercentage = (value, total) => {
  try {
    if (!total || total === 0 || isNaN(value) || isNaN(total)) return '0.0';
    return ((value / total) * 100).toFixed(1);
  } catch (error) {
    return '0.0';
  }
};

export const truncateText = (text, maxLength = 100) => {
  try {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  } catch (error) {
    return '';
  }
};