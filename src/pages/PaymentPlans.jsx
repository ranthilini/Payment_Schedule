import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Download, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate, formatCurrency, exportToCSV } from '../utils/storage';
import AddPlanModal from '../components/AddPlanModal';
import InstallmentTable from '../components/InstallmentTable';

function ConfirmDeleteDialog({ plan, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <div className="text-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 size={24} className="text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Delete Payment Plan?</h3>
          <p className="text-sm text-gray-500 mt-2">
            This will permanently delete <strong>"{plan.name}"</strong> and all its {plan.months} installments. This cannot be undone.
          </p>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onCancel} className="flex-1 btn-secondary justify-center">Cancel</button>
          <button onClick={onConfirm} className="flex-1 btn-danger justify-center">Delete Plan</button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPlans() {
  const { plans, deletePlan, getInstallmentsForPlan } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [deletingPlan, setDeletingPlan] = useState(null);

  const toggleExpand = (id) => setExpandedPlan(prev => prev === id ? null : id);

  const handleDelete = (planId) => {
    deletePlan(planId);
    setDeletingPlan(null);
    if (expandedPlan === planId) setExpandedPlan(null);
  };

  const handleExport = (plan) => {
    const installments = getInstallmentsForPlan(plan.id);
    exportToCSV(plan, installments);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Plans</h1>
          <p className="text-sm text-gray-500 mt-1">{plans.length} plan{plans.length !== 1 ? 's' : ''} total</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#0f2a5c] hover:bg-blue-900 text-white font-medium px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm self-start sm:self-auto"
        >
          <Plus size={18} />
          Add Payment Plan
        </button>
      </div>

      {plans.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={28} className="text-blue-400" />
          </div>
          <h3 className="font-semibold text-gray-700 text-lg">No Payment Plans</h3>
          <p className="text-gray-400 text-sm mt-2 mb-6">Create your first payment plan to get started.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-[#0f2a5c] text-white px-6 py-2.5 rounded-lg hover:bg-blue-900 transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            Create First Plan
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map(plan => {
            const isExpanded = expandedPlan === plan.id;
            const installments = getInstallmentsForPlan(plan.id);
            const paidCount = installments.filter(i => i.status === 'PAID').length;
            const paidAmount = installments.filter(i => i.status === 'PAID').reduce((s, i) => s + Number(i.amount), 0);
            const totalAmount = installments.reduce((s, i) => s + Number(i.amount), 0);
            const progress = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

            return (
              <div key={plan.id} className="card p-0 overflow-hidden">
                {/* Plan Header */}
                <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-bold text-gray-900 text-base">{plan.name}</h2>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        {plan.months} months
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatCurrency(plan.monthlyAmount)}/month · Total: {formatCurrency(totalAmount)}
                    </p>
                    {plan.description && (
                      <p className="text-xs text-gray-400 mt-1">{plan.description}</p>
                    )}
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{paidCount}/{plan.months} paid</span>
                        <span>{progress.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <button
                      onClick={() => handleExport(plan)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors font-medium"
                    >
                      <Download size={13} />
                      CSV
                    </button>
                    <button
                      onClick={() => setDeletingPlan(plan)}
                      className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors font-medium"
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                    <button
                      onClick={() => toggleExpand(plan.id)}
                      className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors font-medium"
                    >
                      {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      {isExpanded ? 'Collapse' : 'View Schedule'}
                    </button>
                  </div>
                </div>

                {/* Installments Table */}
                {isExpanded && (
                  <div className="border-t border-gray-100">
                    <InstallmentTable planId={plan.id} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && <AddPlanModal onClose={() => setShowAddModal(false)} />}
      {deletingPlan && (
        <ConfirmDeleteDialog
          plan={deletingPlan}
          onConfirm={() => handleDelete(deletingPlan.id)}
          onCancel={() => setDeletingPlan(null)}
        />
      )}
    </div>
  );
}

