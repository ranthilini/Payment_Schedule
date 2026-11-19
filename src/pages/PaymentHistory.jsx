import { useState, useMemo } from 'react';
import { Search, Download, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate, formatCurrency, computeStatuses } from '../utils/storage';
import StatusBadge from '../components/StatusBadge';
import EditPaymentModal from '../components/EditPaymentModal';

export default function PaymentHistory() {
  const { plans, installments } = useApp();
  const [editingInst, setEditingInst] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [planFilter, setPlanFilter] = useState('ALL');
  const [monthFilter, setMonthFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  // Paid & overdue installments = "history"
  const historyInstallments = useMemo(() => {
    const seen = new Set();
    return computeStatuses(
      installments.filter(i => { if (seen.has(i.id)) return false; seen.add(i.id); return true; })
    );
  }, [installments]);

  const months = useMemo(() => {
    const set = new Set();
    historyInstallments.forEach(i => {
      if (i.dueDate) {
        const [y, m] = i.dueDate.split('-');
        set.add(`${y}-${m}`);
      }
    });
    return Array.from(set).sort();
  }, [historyInstallments]);

  const filtered = useMemo(() => {
    return historyInstallments.filter(inst => {
      const plan = plans.find(p => p.id === inst.planId);
      if (planFilter !== 'ALL' && inst.planId !== planFilter) return false;
      if (statusFilter !== 'ALL' && inst.status !== statusFilter) return false;
      if (monthFilter) {
        const [y, m] = inst.dueDate.split('-');
        if (`${y}-${m}` !== monthFilter) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const matchPlan = plan?.name.toLowerCase().includes(q);
        const matchNotes = inst.notes?.toLowerCase().includes(q);
        const matchDate = formatDate(inst.dueDate).includes(q);
        const matchActual = inst.actualPaymentDate ? formatDate(inst.actualPaymentDate).includes(q) : false;
        if (!matchPlan && !matchNotes && !matchDate && !matchActual) return false;
      }
      return true;
    }).sort((a, b) => {
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [historyInstallments, plans, planFilter, statusFilter, monthFilter, search, sortOrder]);

  const handleExportCSV = () => {
    if (!filtered.length) return;
    const headers = ['Plan', 'Installment #', 'Due Date', 'Actual Date', 'Amount (LKR)', 'Status', 'Notes'];
    const rows = filtered.map(inst => {
      const plan = plans.find(p => p.id === inst.planId);
      return [
        `"${(plan?.name || '').replace(/"/g, '""')}"`,
        inst.installmentNumber,
        formatDate(inst.dueDate),
        inst.actualPaymentDate ? formatDate(inst.actualPaymentDate) : '-',
        inst.amount,
        inst.status,
        `"${(inst.notes || '').replace(/"/g, '""')}"`,
      ];
    });
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'payment_history.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
          <p className="text-sm text-gray-500 mt-1">All payment transactions</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors self-start sm:self-auto"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} className="input-field">
            <option value="ALL">All Plans</option>
            {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field">
            <option value="ALL">All Statuses</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="OVERDUE">Overdue</option>
          </select>
          <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)} className="input-field">
            <option value="">All Months</option>
            {months.map(m => {
              const [y, mo] = m.split('-');
              const label = new Date(`${y}-${mo}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
              return <option key={m} value={m}>{label}</option>;
            })}
          </select>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-gray-500">Sort by date:</span>
          <button
            onClick={() => setSortOrder('asc')}
            className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${sortOrder === 'asc' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            Oldest First
          </button>
          <button
            onClick={() => setSortOrder('desc')}
            className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${sortOrder === 'desc' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            Newest First
          </button>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400 text-sm">No transactions found matching your filters.</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600 uppercase text-xs">
                  <th className="px-4 py-3 text-left font-semibold">Plan</th>
                  <th className="px-4 py-3 text-left font-semibold">#</th>
                  <th className="px-4 py-3 text-left font-semibold">Due Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Actual Date</th>
                  <th className="px-4 py-3 text-right font-semibold">Amount</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Notes</th>
                  <th className="px-4 py-3 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(inst => {
                  const plan = plans.find(p => p.id === inst.planId);
                  return (
                    <tr key={inst.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-[140px] truncate">
                        {plan?.name || 'Unknown'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{inst.installmentNumber}</td>
                      <td className="px-4 py-3 text-gray-700">{formatDate(inst.dueDate)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {inst.actualPaymentDate ? formatDate(inst.actualPaymentDate) : '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(inst.amount)}</td>
                      <td className="px-4 py-3"><StatusBadge status={inst.status} /></td>
                      <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate text-xs">
                        {inst.notes || <span className="italic text-gray-300">-</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setEditingInst(inst)}
                          className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1.5 rounded-lg font-medium transition-colors"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400 flex justify-between">
            <span>{filtered.length} record{filtered.length !== 1 ? 's' : ''} found</span>
            <span>
              Total: {formatCurrency(filtered.reduce((s, i) => s + Number(i.amount), 0))}
            </span>
          </div>
        </div>
      )}

      {editingInst && (
        <EditPaymentModal
          installment={editingInst}
          onClose={() => setEditingInst(null)}
        />
      )}
    </div>
  );
}

