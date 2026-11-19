export default function StatusBadge({ status }) {
  const map = {
    PAID: 'status-paid',
    PENDING: 'status-pending',
    OVERDUE: 'status-overdue',
  };
  return (
    <span className={map[status] || 'status-pending'}>
      {status}
    </span>
  );
}

