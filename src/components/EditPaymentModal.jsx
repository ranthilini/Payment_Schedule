import { useState } from 'react';
import { X, Save, Trash2, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/storage';

const STATUS_OPTIONS = ['PENDING', 'PAID', 'OVERDUE'];

export default function EditPaymentModal({ installment, onClose }) {
  const { updateInstallment, deleteInstallment } = useApp();
  const [form, setForm] = useState({
    amount: installment.amount,
    dueDate: installment.dueDate,
    actualPaymentDate: installment.actualPaymentDate || '',
    status: installment.status,
    notes: installment.notes || '',
  });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) {
      e.amount = 'Please enter a valid amount';
    }
    if (!form.dueDate) e.dueDate = 'Due date is required';
    if (form.status === 'PAID' && !form.actualPaymentDate) {
      e.actualPaymentDate = 'Please enter the actual payment date for PAID status';
    }
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    updateInstallment(installment.id, {
      amount: Number(form.amount),
      dueDate: form.dueDate,
      actualPaymentDate: form.actualPaymentDate,
      status: form.status,
      notes: form.notes,
      paidAt: form.status === 'PAID' ? (installment.paidAt || new Date().toISOString()) : null,
    });
    onClose();
  };

  const handleDelete = () => {
    deleteInstallment(installment.id);
    onClose();
  };

  const change = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    setErrors(e => ({ ...e, [field]: undefined }));
    // Auto-set actual date when marking as paid
    if (field === 'status' && val === 'PAID' && !form.actualPaymentDate) {
      const today = new Date().toISOString().split('T')[0];
      setForm(f => ({ ...f, status: val, actualPaymentDate: today }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Edit Installment #{installment.installmentNumber}</h2>
            <p className="text-sm text-gray-500">Modify payment record details</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount (LKR)</label>
            <input
              type="number"
              value={form.amount}
              onChange={e => change('amount', e.target.value)}
              className="input-field"
              min="0"
              step="0.01"
            />
            {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
            <select
              value={form.status}
              onChange={e => change('status', e.target.value)}
              className="input-field"
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar size={14} className="inline mr-1" />
              Payment Due Date
            </label>
            <input
              type="date"
              value={form.dueDate}
              onChange={e => change('dueDate', e.target.value)}
              className="input-field"
            />
            {errors.dueDate && <p className="text-xs text-red-500 mt-1">{errors.dueDate}</p>}
          </div>

          {/* Actual Payment Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar size={14} className="inline mr-1" />
              Actual Payment Date
            </label>
            <input
              type="date"
              value={form.actualPaymentDate}
              onChange={e => change('actualPaymentDate', e.target.value)}
              className="input-field"
            />
            {errors.actualPaymentDate && <p className="text-xs text-red-500 mt-1">{errors.actualPaymentDate}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => change('notes', e.target.value)}
              rows={4}
              className="input-field resize-none"
              placeholder="e.g. Paid through bank transfer, Payment delayed, Partial payment received..."
            />
          </div>

          {/* Summary */}
          <div className="bg-blue-50 rounded-lg p-3 text-sm">
            <p className="text-blue-800 font-medium">Payment Summary</p>
            <p className="text-blue-600 mt-1">Amount: {formatCurrency(form.amount || 0)}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="btn-danger text-sm"
            >
              <Trash2 size={16} />
              Delete
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-600 font-medium">Confirm delete?</span>
              <button onClick={handleDelete} className="bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-red-700">Yes, Delete</button>
              <button onClick={() => setConfirmDelete(false)} className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-200">Cancel</button>
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-secondary text-sm">Cancel</button>
            <button
              onClick={handleSave}
              className="bg-[#0f2a5c] hover:bg-blue-900 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2"
            >
              <Save size={16} />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

