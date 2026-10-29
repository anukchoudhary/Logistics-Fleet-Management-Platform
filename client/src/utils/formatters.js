export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatMileage = (km) => {
  if (km === undefined || km === null) return '0 km';
  return `${Number(km).toLocaleString('en-IN')} km`;
};

export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Available':
    case 'Delivered':
    case 'Completed':
    case 'Active':
      return 'badge-success';

    case 'In Transit':
    case 'Picked Up':
    case 'Out for Delivery':
    case 'On Trip':
      return 'badge-info';

    case 'Pending':
    case 'Assigned':
    case 'Scheduled':
      return 'badge-warning';

    case 'Maintenance':
    case 'In Progress':
    case 'Delayed':
      return 'badge-warning';

    case 'Cancelled':
    case 'Inactive':
    case 'Overdue':
      return 'badge-danger';

    default:
      return 'badge-neutral';
  }
};
