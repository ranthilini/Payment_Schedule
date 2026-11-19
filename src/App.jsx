import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import PaymentPlans from './pages/PaymentPlans';
import PaymentSchedule from './pages/PaymentSchedule';
import PaymentHistory from './pages/PaymentHistory';
import { Loader2 } from 'lucide-react';

function AppShell() {
  // No authentication state; app loads directly.
  const { dataLoading } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Optional loading indicator for data sync (Firestore still works without auth if rules allow public reads).
  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Syncing your data...</p>
        </div>
      </div>
    );
  }

  // Main app UI (no login required)
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(o => !o)} />
      <main className="flex-1 overflow-y-auto">
        <div className="lg:hidden h-16" />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/plans" element={<PaymentPlans />} />
          <Route path="/schedule" element={<PaymentSchedule />} />
          <Route path="/history" element={<PaymentHistory />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AppProvider>
  );
}

