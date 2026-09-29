import { useState, useEffect, useRef } from 'react';
import { AppState, Transaction, RecurringExpense, FinancialGoal, CategoryGroup, EmergencyFund } from '../types';
import { DEFAULT_INITIAL_STATE, DEFAULT_CATEGORIES, DEFAULT_EMERGENCY_FUND } from '../data/defaultData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'moneysaver_v1_state';
const SUPABASE_ROW_ID = 'merlin_primary_wallet';

export function useAppState() {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'offline'>('idle');
  const isRemoteUpdateRef = useRef(false);

  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Tự động đồng bộ danh mục mới (bao gồm Đi lại / transport)
        const hasTransport = parsed.categories?.some((c: CategoryGroup) => c.id === 'transport');
        if (!hasTransport) {
          parsed.categories = DEFAULT_CATEGORIES;
        } else if (parsed.categories) {
          // Chuẩn hóa icon 'Package' cho 'supplies', loại bỏ triệt để 'Sparkles' cũ còn lưu trong DB
          parsed.categories = parsed.categories.map((c: CategoryGroup) => {
            if (c.id === 'supplies' && c.icon === 'Sparkles') {
              return { ...c, icon: 'Package' };
            }
            return c;
          });
        }

        // Tự động khởi tạo quỹ khẩn cấp nếu chưa có
        if (!parsed.emergencyFund) {
          parsed.emergencyFund = DEFAULT_EMERGENCY_FUND;
        }

        // Tự động đảm bảo khoản tiền trọ có anchorMonth là 2026-10 nếu bị thiếu
        if (parsed.recurringExpenses) {
          parsed.recurringExpenses = parsed.recurringExpenses.map((rec: RecurringExpense) => {
            if (rec.cycle === 'quarterly' && !rec.anchorMonth) {
              return { ...rec, anchorMonth: '2026-10' };
            }
            return rec;
          });
        }

        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse state from localStorage', e);
    }
    return DEFAULT_INITIAL_STATE;
  });

  // Tải dữ liệu ban đầu từ Supabase và lắng nghe thay đổi thời gian thực
  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) {
      setSyncStatus('offline');
      return;
    }

    let isMounted = true;

    async function loadCloudData() {
      try {
        setSyncStatus('syncing');
        const { data, error } = await supabase!
          .from('moneysaver_data')
          .select('data, updated_at')
          .eq('id', SUPABASE_ROW_ID)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 là chưa có bản ghi nào
          console.warn('Supabase fetch error:', error);
          if (isMounted) setSyncStatus('offline');
          return;
        }

        if (data && data.data) {
          const cloudState = data.data as AppState;
          if (cloudState.categories) {
            cloudState.categories = cloudState.categories.map((c: CategoryGroup) => {
              if (c.id === 'supplies' && c.icon === 'Sparkles') {
                return { ...c, icon: 'Package' };
              }
              return c;
            });
          }
          if (cloudState.recurringExpenses) {
            cloudState.recurringExpenses = cloudState.recurringExpenses.map((rec: RecurringExpense) => {
              if (rec.cycle === 'quarterly' && !rec.anchorMonth) {
                return { ...rec, anchorMonth: '2026-10' };
              }
              return rec;
            });
          }
          if (isMounted) {
            isRemoteUpdateRef.current = true;
            setState(cloudState);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudState));
            setSyncStatus('synced');
          }
        } else {
          // Chưa có bản ghi trên cloud, đẩy state hiện tại lên Supabase lần đầu
          const { error: insertError } = await supabase!
            .from('moneysaver_data')
            .upsert({
              id: SUPABASE_ROW_ID,
              data: state,
              updated_at: new Date().toISOString(),
            });
          if (!insertError && isMounted) {
            setSyncStatus('synced');
          }
        }
      } catch (err) {
        console.error('Lỗi kết nối Supabase:', err);
        if (isMounted) setSyncStatus('offline');
      }
    }

    loadCloudData();

    // Lắng nghe thay đổi Realtime (khi điện thoại nhập thì laptop tự nhảy ngay)
    const channel = supabase
      .channel('moneysaver_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'moneysaver_data',
          filter: `id=eq.${SUPABASE_ROW_ID}`,
        },
        (payload: any) => {
          if (payload.new && payload.new.data) {
            isRemoteUpdateRef.current = true;
            const updated = payload.new.data as AppState;
            if (updated.categories) {
              updated.categories = updated.categories.map((c: CategoryGroup) => {
                if (c.id === 'supplies' && c.icon === 'Sparkles') {
                  return { ...c, icon: 'Package' };
                }
                return c;
              });
            }
            setState(updated);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            setSyncStatus('synced');
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase?.removeChannel(channel);
    };
  }, []);

  // Lưu vào localStorage và đồng bộ lên Supabase khi state thay đổi
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }

    // Nếu thay đổi đến từ Supabase Realtime thì không cần đẩy ngược lại
    if (isRemoteUpdateRef.current) {
      isRemoteUpdateRef.current = false;
      return;
    }

    if (!supabase || !isSupabaseConfigured) return;

    const timer = setTimeout(async () => {
      try {
        setSyncStatus('syncing');
        const { error } = await supabase!
          .from('moneysaver_data')
          .upsert({
            id: SUPABASE_ROW_ID,
            data: state,
            updated_at: new Date().toISOString(),
          });

        if (error) {
          console.warn('Lỗi đồng bộ lên Supabase:', error);
          setSyncStatus('offline');
        } else {
          setSyncStatus('synced');
        }
      } catch (err) {
        console.error('Lỗi push Supabase:', err);
        setSyncStatus('offline');
      }
    }, 400); // Debounce 400ms để tránh spam request liên tục

    return () => clearTimeout(timer);
  }, [state]);

  // Profile actions
  const updateProfile = (profile: Partial<AppState['profile']>) => {
    setState((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...profile },
    }));
  };

  const completeOnboarding = (salary: number, recurring: RecurringExpense[], goals: FinancialGoal[]) => {
    setState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        monthlySalary: salary,
        isOnboarded: true,
      },
      recurringExpenses: recurring,
      goals: goals,
    }));
  };

  // Transaction actions
  const addTransaction = (
    amount: number,
    groupId: string,
    subCategoryId: string,
    notes?: string,
    type: 'expense' | 'income' = 'expense',
    customDate?: string
  ) => {
    let group = state.categories.find((g) => g.id === groupId);
    let sub = group?.subcategories.find((s) => s.id === subCategoryId);
    
    // Nếu không tìm thấy bằng groupId, tìm khắp các category
    if (!sub) {
      for (const g of state.categories) {
        const found = g.subcategories.find((s) => s.id === subCategoryId);
        if (found) {
          group = g;
          sub = found;
          break;
        }
      }
    }

    const now = new Date();
    const dateStr = customDate || now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newTx: Transaction = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      type,
      amount,
      groupId: group?.id || groupId,
      subCategoryId,
      subCategoryName: sub?.name || (type === 'income' ? 'Thu nhập thêm' : 'Chi tiêu'),
      date: dateStr,
      time: timeStr,
      notes: notes || '',
    };

    setState((prev) => ({
      ...prev,
      transactions: [newTx, ...prev.transactions],
    }));

    return newTx;
  };

  const deleteTransaction = (id: string) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((tx) => tx.id !== id),
    }));
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx)),
    }));
  };

  // Category Actions: Thêm con, đổi tên cha, đổi icon tại chỗ
  const addSubCategory = (groupId: string, name: string, icon = 'Tag', monthlyLimit?: number) => {
    const newSubId = 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5);
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((group) => {
        if (group.id !== groupId) return group;
        return {
          ...group,
          subcategories: [...group.subcategories, { id: newSubId, name, icon, monthlyLimit }],
        };
      }),
    }));
    return newSubId;
  };

  const updateGroupBudget = (groupId: string, budget: number) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((g) => (g.id === groupId ? { ...g, monthlyBudget: budget } : g)),
    }));
  };

  // Recurring expense actions: sửa giá tháng này hoặc cập nhật giá mới vĩnh viễn
  const updateRecurringExpense = (id: string, updates: Partial<RecurringExpense>) => {
    setState((prev) => ({
      ...prev,
      recurringExpenses: prev.recurringExpenses.map((rec) => (rec.id === id ? { ...rec, ...updates } : rec)),
    }));
  };

  const overrideRecurringMonth = (id: string, monthKey: string, amount: number) => {
    setState((prev) => ({
      ...prev,
      recurringExpenses: prev.recurringExpenses.map((rec) => {
        if (rec.id !== id) return rec;
        return {
          ...rec,
          monthlyOverrides: {
            ...(rec.monthlyOverrides || {}),
            [monthKey]: amount,
          },
        };
      }),
    }));
  };

  const toggleRecurringPaid = (recurringId: string, monthKey: string) => {
    setState((prev) => {
      const rec = prev.recurringExpenses.find((r) => r.id === recurringId);
      if (!rec) return prev;

      const isCurrentlyPaid = Boolean(rec.paidMonths?.[monthKey]);
      const nextPaid = !isCurrentlyPaid;

      // Cập nhật trạng thái paidMonths của khoản định kỳ
      const updatedRecurring = prev.recurringExpenses.map((item) => {
        if (item.id !== recurringId) return item;
        const currentPaidMap = { ...(item.paidMonths || {}) };
        if (nextPaid) {
          currentPaidMap[monthKey] = true;
        } else {
          delete currentPaidMap[monthKey];
        }
        return {
          ...item,
          paidMonths: currentPaidMap,
        };
      });

      let updatedTransactions = [...prev.transactions];

      if (nextPaid) {
        // Tự động tạo giao dịch chi phí trong lịch sử
        const effectiveAmount = rec.monthlyOverrides?.[monthKey] ?? rec.amount;
        const now = new Date();
        const dateStr = `${monthKey}-${String(now.getDate()).padStart(2, '0')}`;
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        const newTx: Transaction = {
          id: `rec_tx_${rec.id}_${monthKey}`,
          type: 'expense',
          amount: effectiveAmount,
          groupId: 'fixed',
          subCategoryId: rec.subCategoryId || 'fixed_cost',
          subCategoryName: rec.name,
          date: dateStr,
          time: timeStr,
          notes: `Đã đóng chi phí định kỳ tháng ${monthKey}`,
          isRecurringInstance: true,
        };
        // Tránh trùng lặp nếu đã từng có
        updatedTransactions = [newTx, ...updatedTransactions.filter(t => t.id !== newTx.id)];
      } else {
        // Nếu bỏ tick, xóa giao dịch tự động tương ứng khỏi lịch sử
        const targetTxId = `rec_tx_${rec.id}_${monthKey}`;
        updatedTransactions = updatedTransactions.filter((t) => t.id !== targetTxId);
      }

      return {
        ...prev,
        recurringExpenses: updatedRecurring,
        transactions: updatedTransactions,
      };
    });
  };

  // Goals actions
  const addGoal = (goal: Omit<FinancialGoal, 'id'>) => {
    const newGoal: FinancialGoal = {
      ...goal,
      id: 'goal_' + Date.now(),
    };
    setState((prev) => ({
      ...prev,
      goals: [...prev.goals, newGoal].sort((a, b) => a.priority - b.priority),
    }));
  };

  const updateGoal = (id: string, updates: Partial<FinancialGoal>) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)).sort((a, b) => a.priority - b.priority),
    }));
  };

  const deleteGoal = (id: string) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== id),
    }));
  };

  // Emergency Fund Actions
  const updateEmergencyFundSettings = (updates: Partial<Pick<EmergencyFund, 'monthlyAllocation' | 'targetAmount'>>) => {
    setState((prev) => ({
      ...prev,
      emergencyFund: {
        ...(prev.emergencyFund || DEFAULT_EMERGENCY_FUND),
        ...updates,
      },
    }));
  };

  const depositEmergencyFund = (amount: number, reason: string = 'Trích quỹ định kỳ') => {
    if (amount <= 0) return;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setState((prev) => {
      const fund = prev.emergencyFund || DEFAULT_EMERGENCY_FUND;
      const newBalance = fund.currentBalance + amount;
      const newLog = {
        id: 'emg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        type: 'deposit' as const,
        amount,
        reason,
        date: dateStr,
        time: timeStr,
      };

      return {
        ...prev,
        emergencyFund: {
          ...fund,
          currentBalance: newBalance,
          logs: [newLog, ...(fund.logs || [])],
        },
      };
    });
  };

  const withdrawEmergencyFund = (amount: number, reason: string) => {
    if (amount <= 0) return;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setState((prev) => {
      const fund = prev.emergencyFund || DEFAULT_EMERGENCY_FUND;
      const newBalance = Math.max(0, fund.currentBalance - amount);
      const newLog = {
        id: 'emg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        type: 'withdraw' as const,
        amount,
        reason: reason || 'Sự cố khẩn cấp',
        date: dateStr,
        time: timeStr,
      };

      return {
        ...prev,
        emergencyFund: {
          ...fund,
          currentBalance: newBalance,
          logs: [newLog, ...(fund.logs || [])],
        },
      };
    });
  };

  // Export / Import JSON
  const exportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `moneysaver_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importData = (jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.profile && parsed.categories) {
        setState(parsed);
        return true;
      }
    } catch (e) {
      console.error('Import failed', e);
    }
    return false;
  };

  const resetAllData = () => {
    setState(DEFAULT_INITIAL_STATE);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    state,
    syncStatus,
    updateProfile,
    completeOnboarding,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    addSubCategory,
    updateGroupBudget,
    updateRecurringExpense,
    overrideRecurringMonth,
    toggleRecurringPaid,
    addGoal,
    updateGoal,
    deleteGoal,
    updateEmergencyFundSettings,
    depositEmergencyFund,
    withdrawEmergencyFund,
    exportData,
    importData,
    resetAllData,
  };
}
