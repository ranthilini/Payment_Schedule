import { useState } from 'react';
import { Plus, Download, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate, formatCurrency, exportToCSV, computeStatuses } from '../utils/storage';
import AddPlanModal from '../components/AddPlanModal';
import EditPaymentModal from '../components/EditPaymentModal';
import StatusBadge from '../components/StatusBadge';

export default function PaymentSchedule() {
  const { plans, installments, getInstallmentsForPlan } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingInst, setEditingInst] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Deduplicate by installment ID
  const seen = new Set();
  const allInstallments = computeStatuses(
    installments.filter(i => { if (seen.has(i.id)) return false; seen.add(i.id); return true; })
  );

  const filtered = allInstallments.filter(inst => {
    const plan = plans.find(p => p.id === inst.planId);
    if (selectedPlan !== 'ALL' && inst.planId !== selectedPlan) return false;
    if (statusFilter !== 'ALL' && inst.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchPlan = plan?.name.toLowerCase().includes(q);
      const matchNotes = inst.notes?.toLowerCase().includes(q);
      const matchDate = formatDate(inst.dueDate).includes(q);
      if (!matchPlan && !matchNotes && !matchDate) return false;
    }
    return true;
  }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const handleExportAll = () => {
    if (plans.length === 0) return;
    plans.forEach(plan => {
      const insts = getInstallmentsForPlan(plan.id);
      exportToCSV(plan, insts);
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Schedule</h1>
          <p className="text-sm text-gray-500 mt-1">All installments across payment plans</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportAll}
            className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
          >
            <Download size={16} />
            Export All
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#0f2a5c] hover:bg-blue-900 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
          >
            <Plus size={16} />
            Add Plan
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card py-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search payments..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <select
            value={selectedPlan}
            onChange={e => setSelectedPlan(e.target.value)}
            className="input-field"
          >
            <option value="ALL">All Plans</option>
            {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="ALL">All Statuses</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400 text-sm">No payments match your filters.</p>
          {installments.length === 0 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 inline-flex items-center gap-2 bg-[#0f2a5c] text-white px-6 py-2.5 rounded-lg hover:bg-blue-900 text-sm font-medium"
            >
              <Plus size={16} />
              Create Payment Plan
            </button>
          )}
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
                  <th className="px-4 py-3 text-right font-semibold">Amount</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Actual Date</th>
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
                        {plan?.name || 'Unknown Plan'}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{inst.installmentNumber}</td>
                      <td className="px-4 py-3 text-gray-700">{formatDate(inst.dueDate)}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(inst.amount)}</td>
                      <td className="px-4 py-3"><StatusBadge status={inst.status} /></td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {inst.actualPaymentDate ? formatDate(inst.actualPaymentDate) : '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate text-xs">
                        {inst.notes || <span className="italic text-gray-300">-</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setEditingInst(inst)}
                          className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1.5 rounded-lg transition-colors font-medium"
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
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
            Showing {filtered.length} of {allInstallments.length} installments
          </div>
        </div>
      )}

      {showAddModal && <AddPlanModal onClose={() => setShowAddModal(false)} />}
      {editingInst && (
        <EditPaymentModal
          installment={editingInst}
          onClose={() => setEditingInst(null)}
        />
      )}
    </div>
  );
}

