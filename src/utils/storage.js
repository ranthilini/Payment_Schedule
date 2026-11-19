// ─── Pure utility functions (no LocalStorage needed — Firebase handles storage) ───

// Generate unique ID (still used for client-side temp ops)
export const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Format date as DD/MM/YYYY
export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr + 'T00:00:00');
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  } catch {
    return dateStr;
  }
};

// Add months to a date, handling end-of-month correctly
// e.g. Jan 31 + 1 month = Feb 28 (not March 3)
export const addMonths = (dateStr, months) => {
  const date = new Date(dateStr + 'T00:00:00');
  const targetMonth = date.getMonth() + months;
  const result = new Date(date.getFullYear(), targetMonth, 1);
  const originalDay = date.getDate();
  const daysInTarget = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(originalDay, daysInTarget));
  return result.toISOString().split('T')[0];
};

// Generate installments array from a plan object
export const generateInstallments = (plan) => {
  const { id, monthlyAmount, months, firstPaymentDate } = plan;
  return Array.from({ length: months }, (_, i) => ({
    planId:              id,
    installmentNumber:   i + 1,
    dueDate:             addMonths(firstPaymentDate, i),
    amount:              monthlyAmount,
    status:              'PENDING',
    notes:               '',
    actualPaymentDate:   '',
    paidAt:              null,
  }));
};

// Auto-compute OVERDUE status (non-destructive — PAID is never changed)
export const computeStatuses = (installments) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return installments.map(inst => {
    if (inst.status === 'PAID') return inst;
    const due = new Date(inst.dueDate + 'T00:00:00');
    return due < today ? { ...inst, status: 'OVERDUE' } : inst;
  });
};

// Format LKR currency
export const formatCurrency = (amount) =>
  `LKR ${Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// Export installments to CSV file download
export const exportToCSV = (plan, installments) => {
  const headers = ['Installment #', 'Due Date', 'Amount (LKR)', 'Status', 'Actual Payment Date', 'Notes'];
  const rows = installments.map(inst => [
    inst.installmentNumber,
    formatDate(inst.dueDate),
    inst.amount,
    inst.status,
    inst.actualPaymentDate ? formatDate(inst.actualPaymentDate) : '-',
    `"${(inst.notes || '').replace(/"/g, '""')}"`,
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${plan.name.replace(/\s+/g, '_')}_payments.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};
