import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/storage';
import {
  DollarSign, TrendingUp, TrendingDown, List,
  CheckCircle, Clock, AlertCircle
} from 'lucide-react';

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg}`}>
        <Icon size={22} className={color} />
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase font-medium tracking-wide">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { getDashboardStats, plans } = useApp();
  const stats = getDashboardStats();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of all payment plans</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Total Amount"
          value={formatCurrency(stats.totalAmount)}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Paid"
          value={formatCurrency(stats.paidAmount)}
          color="text-green-600"
          bg="bg-green-50"
        />
        <StatCard
          icon={TrendingDown}
          label="Remaining Balance"
          value={formatCurrency(stats.remainingBalance)}
          color="text-purple-600"
          bg="bg-purple-50"
        />
        <StatCard
          icon={List}
          label="Total Installments"
          value={stats.totalInstallments}
          color="text-indigo-600"
          bg="bg-indigo-50"
        />
        <StatCard
          icon={CheckCircle}
          label="Paid Installments"
          value={stats.paidInstallments}
          color="text-green-600"
          bg="bg-green-50"
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value={stats.pendingInstallments}
          color="text-yellow-600"
          bg="bg-yellow-50"
        />
        <StatCard
          icon={AlertCircle}
          label="Overdue"
          value={stats.overdueInstallments}
          color="text-red-600"
          bg="bg-red-50"
        />
      </div>

      {/* Progress Bar */}
      <div className="card">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-gray-800">Payment Completion</h2>
          <span className="text-sm font-bold text-blue-700">{stats.progressPercent.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
          <div
            className="h-4 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full transition-all duration-700"
            style={{ width: `${Math.min(stats.progressPercent, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>{formatCurrency(stats.paidAmount)} paid</span>
          <span>{formatCurrency(stats.remainingBalance)} remaining</span>
        </div>
      </div>

      {/* Plans Overview */}
      {plans.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Payment Plans</h2>
          <div className="space-y-3">
            {plans.map(plan => {
              const planTotal = plan.monthlyAmount * plan.months;
              return (
                <div key={plan.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{plan.name}</p>
                    <p className="text-xs text-gray-500">{plan.months} months · {formatCurrency(plan.monthlyAmount)}/mo</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-gray-900 text-sm">{formatCurrency(planTotal)}</p>
                    <p className="text-xs text-gray-400">total</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {plans.length === 0 && (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <DollarSign size={28} className="text-blue-400" />
          </div>
          <h3 className="font-semibold text-gray-700 text-lg">No Payment Plans Yet</h3>
          <p className="text-gray-400 text-sm mt-2">Go to "Payment Plans" to create your first plan.</p>
        </div>
      )}
    </div>
  );
}

