import { useState } from 'react';
import { Pencil, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate, formatCurrency, computeStatuses } from '../utils/storage';
import StatusBadge from './StatusBadge';
import EditPaymentModal from './EditPaymentModal';

export default function InstallmentTable({ planId }) {
  const { getInstallmentsForPlan } = useApp();
  const [editingInst, setEditingInst] = useState(null);

  const installments = getInstallmentsForPlan(planId);

  if (!installments.length) {
    return <p className="text-gray-400 text-sm py-4 text-center">No installments found.</p>;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600 uppercase text-xs">
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
            {installments.map(inst => (
              <tr key={inst.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{inst.installmentNumber}</td>
                <td className="px-4 py-3 text-gray-700">{formatDate(inst.dueDate)}</td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(inst.amount)}</td>
                <td className="px-4 py-3"><StatusBadge status={inst.status} /></td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {inst.actualPaymentDate ? formatDate(inst.actualPaymentDate) : '-'}
                </td>
                <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate text-xs">
                  {inst.notes || <span className="italic text-gray-300">No notes</span>}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => setEditingInst(inst)}
                    className="inline-flex items-center gap-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1.5 rounded-lg transition-colors font-medium"
                  >
                    <Pencil size={12} />
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingInst && (
        <EditPaymentModal
          installment={editingInst}
          onClose={() => setEditingInst(null)}
        />
      )}
    </>
  );
}

