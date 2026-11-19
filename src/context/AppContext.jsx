import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { collection, doc, addDoc, deleteDoc, updateDoc, onSnapshot, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config';
import { generateInstallments, computeStatuses } from '../utils/storage';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // No auth – using public collections.
  const [plans, setPlans] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Real-time listeners for public collections.
  // Real-time listeners for public collections.
useEffect(() => {
  // Start loading indicator
  setDataLoading(true);
  const plansRef = collection(db, 'plans');
  const installsRef = collection(db, 'installments');

  const unsubPlans = onSnapshot(plansRef, (snap) => {
    setPlans(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, (error) => {
    console.error('Plans listener error:', error);
  });

  const unsubInstalls = onSnapshot(installsRef, (snap) => {
    setInstallments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, (error) => {
    console.error('Installments listener error:', error);
  });

  // Loading complete once listeners are attached (Firestore will push initial data shortly).
  setDataLoading(false);

  return () => {
    unsubPlans();
    unsubInstalls();
  };
}, []);

  // Plan CRUD
    const addPlan = useCallback(async (planData) => {
    try {
      const plansRef = collection(db, 'plans');
      const installsRef = collection(db, 'installments');

      // Create the plan document → Firestore gives us the auto ID
      const planRef = await addDoc(plansRef, {
        ...planData,
        createdAt: new Date().toISOString(),
      });

      // Generate installments using the new plan ID
      const instList = generateInstallments({ ...planData, id: planRef.id });

      // Batch‑write all installments (atomic, fast)
      const batch = writeBatch(db);
      instList.forEach(inst => {
        const instDoc = doc(installsRef); // auto ID
        batch.set(instDoc, inst);
      });
      await batch.commit();
    } catch (e) {
      console.error('Error adding plan:', e);
    }
  }, []);

  const deletePlan = useCallback(async (planId) => {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'plans', planId));
    installments
      .filter(i => i.planId === planId)
      .forEach(i => batch.delete(doc(db, 'installments', i.id)));
    await batch.commit();
  }, [installments]);

  const updatePlan = useCallback(async (planId, updates) => {
    await updateDoc(doc(db, 'plans', planId), updates);
  }, []);

  const updateInstallment = useCallback(async (installmentId, updates) => {
    await updateDoc(doc(db, 'installments', installmentId), updates);
  }, []);

  const deleteInstallment = useCallback(async (installmentId) => {
    await deleteDoc(doc(db, 'installments', installmentId));
  }, []);

  // Derived helpers
  const getInstallmentsForPlan = useCallback((planId) => {
    return computeStatuses(
      installments.filter(i => i.planId === planId)
    ).sort((a, b) => a.installmentNumber - b.installmentNumber);
  }, [installments]);

  const getDashboardStats = useCallback(() => {
    const all = computeStatuses(installments);
    const total = all.reduce((s, i) => s + Number(i.amount), 0);
    const paidList = all.filter(i => i.status === 'PAID');
    const paid = paidList.reduce((s, i) => s + Number(i.amount), 0);
    return {
      totalAmount: total,
      paidAmount: paid,
      remainingBalance: total - paid,
      totalInstallments: all.length,
      paidInstallments: paidList.length,
      pendingInstallments: all.filter(i => i.status === 'PENDING').length,
      overdueInstallments: all.filter(i => i.status === 'OVERDUE').length,
      progressPercent: total > 0 ? (paid / total) * 100 : 0,
    };
  }, [installments]);

  return (
    <AppContext.Provider value={{
      plans,
      installments,
      dataLoading,
      addPlan,
      deletePlan,
      updatePlan,
      updateInstallment,
      deleteInstallment,
      getInstallmentsForPlan,
      getDashboardStats,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};