import { useState } from 'react';
import { X, Plus, Calendar, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/storage';

const DEFAULT_FORM = {
  name: '',
  monthlyAmount: '',
  months: '12',
  startDate: '',
  firstPaymentDate: '',
  description: '',
  notes: '',
};

export default function AddPlanModal({ onClose }) {
  const { addPlan } = useApp();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState({});

  const totalPayment = Number(form.monthlyAmount || 0) * Number(form.months || 0);

  const change = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    setErrors(e => ({ ...e, [field]: undefined }));
    // Auto-set firstPaymentDate from startDate
    if (field === 'startDate' && !form.firstPaymentDate) {
      setForm(f => ({ ...f, startDate: val, firstPaymentDate: val }));
    }
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Plan name is required';
    if (!form.monthlyAmount || isNaN(form.monthlyAmount) || Number(form.monthlyAmount) <= 0) {
      e.monthlyAmount = 'Enter a valid monthly amount';
    }
    if (!form.months || isNaN(form.months) || Number(form.months) < 1 || Number(form.months) > 360) {
      e.months = 'Months must be between 1 and 360';
    }
    if (!form.startDate) e.startDate = 'Start date is required';
    if (!form.firstPaymentDate) e.firstPaymentDate = 'First payment date is required';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    addPlan({
      name: form.name.trim(),
      monthlyAmount: Number(form.monthlyAmount),
      months: Number(form.months),
      startDate: form.startDate,
      firstPaymentDate: form.firstPaymentDate,
      description: form.description.trim(),
      notes: form.notes.trim(),
      totalAmount: totalPayment,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Create Payment Plan</h2>
            <p className="text-sm text-gray-500">Set up a new monthly payment schedule</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Plan Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => change('name', e.target.value)}
                className="input-field"
                placeholder="e.g. Monthly Payment Plan"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Monthly Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Payment (LKR) *</label>
              <input
                type="number"
                value={form.monthlyAmount}
                onChange={e => change('monthlyAmount', e.target.value)}
                className="input-field"
                placeholder="70000"
                min="0"
                step="0.01"
              />
              {errors.monthlyAmount && <p className="text-xs text-red-500 mt-1">{errors.monthlyAmount}</p>}
            </div>

            {/* Number of Months */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Months *</label>
              <input
                type="number"
                value={form.months}
                onChange={e => change('months', e.target.value)}
                className="input-field"
                placeholder="12"
                min="1"
                max="360"
              />
              {errors.months && <p className="text-xs text-red-500 mt-1">{errors.months}</p>}
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar size={14} className="inline mr-1" />
                Start Date *
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={e => change('startDate', e.target.value)}
                className="input-field"
              />
              {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
            </div>

            {/* First Payment Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar size={14} className="inline mr-1" />
                First Payment Date *
              </label>
              <input
                type="date"
                value={form.firstPaymentDate}
                onChange={e => change('firstPaymentDate', e.target.value)}
                className="input-field"
              />
              {errors.firstPaymentDate && <p className="text-xs text-red-500 mt-1">{errors.firstPaymentDate}</p>}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={e => change('description', e.target.value)}
                rows={2}
                className="input-field resize-none"
                placeholder="Brief description of this payment plan..."
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={form.notes}
                onChange={e => change('notes', e.target.value)}
                rows={2}
                className="input-field resize-none"
                placeholder="Additional notes..."
              />
            </div>
          </div>

          {/* Total Calculation Preview */}
          {form.monthlyAmount && form.months && (
            <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <Info size={16} className="text-blue-600" />
                <p className="font-semibold text-blue-900 text-sm">Payment Plan Summary</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-xs text-blue-500 uppercase font-medium">Monthly</p>
                  <p className="font-bold text-blue-900 text-sm">{formatCurrency(form.monthlyAmount || 0)}</p>
                </div>
                <div className="text-center border-x border-blue-200">
                  <p className="text-xs text-blue-500 uppercase font-medium">Duration</p>
                  <p className="font-bold text-blue-900 text-sm">{form.months} Months</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-blue-500 uppercase font-medium">Total</p>
                  <p className="font-bold text-blue-900 text-sm">{formatCurrency(totalPayment)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#0f2a5c] hover:bg-blue-900 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Create Plan & Generate Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

