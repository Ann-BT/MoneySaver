import React, { useState } from 'react';
import { useAppState } from './hooks/useAppState';
import { OnboardingWizard } from './components/OnboardingWizard';
import { QuickNumpad } from './components/QuickNumpad';
import { RecurringManager } from './components/RecurringManager';
import { GoalsTracker } from './components/GoalsTracker';
import { TransactionList } from './components/TransactionList';
import { EmergencyFundManager } from './components/EmergencyFundManager';
import { DEFAULT_EMERGENCY_FUND } from './data/defaultData';
import { formatVND, getCurrentMonthKey, isRecurringDueInMonth } from './utils/formatters';
import {
  Wallet,
  Target,
  Home,
  Clock,
  Sparkles,
  Download,
  Upload,
  RotateCcw,
  Zap,
  TrendingDown,
  ShieldCheck,
  ShieldAlert,
  Cloud,
  CloudCheck,
  RefreshCw,
} from 'lucide-react';

export function App() {
  const {
    state,
    syncStatus,
    updateProfile,
    completeOnboarding,
    addTransaction,
    deleteTransaction,
    addSubCategory,
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
  } = useAppState();

  const [activeTab, setActiveTab] = useState<'quick' | 'goals' | 'emergency' | 'recurring' | 'history'>('quick');
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  // Nếu chưa hoàn thành onboarding 3 bước, hiển thị wizard theo đúng yêu cầu
  if (!state.profile.isOnboarded) {
    return <OnboardingWizard onComplete={completeOnboarding} />;
  }

  const currentMonthKey = getCurrentMonthKey();

  // Tính tổng thu nhập thêm trong tháng hiện tại
  const currentMonthExtraIncome = state.transactions
    .filter((tx) => tx.date.startsWith(currentMonthKey) && tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Tổng thu nhập tháng = Lương cố định + Thu nhập thêm
  const totalMonthlyIncome = state.profile.monthlySalary + currentMonthExtraIncome;

  // Tính tổng chi phí cố định đến hạn tháng này
  const currentMonthFixedItems = state.recurringExpenses.filter((item) =>
    isRecurringDueInMonth(item, currentMonthKey)
  );
  const currentMonthFixedDue = currentMonthFixedItems.reduce((sum, item) => {
    const effective = item.monthlyOverrides?.[currentMonthKey] ?? item.amount;
    return sum + effective;
  }, 0);

  // Tính số tiền cố định ĐÃ ĐÓNG (được tick)
  const currentMonthFixedPaid = currentMonthFixedItems
    .filter((item) => Boolean(item.paidMonths?.[currentMonthKey]))
    .reduce((sum, item) => {
      const effective = item.monthlyOverrides?.[currentMonthKey] ?? item.amount;
      return sum + effective;
    }, 0);

  // Tính tổng các giao dịch chi tiêu hàng ngày (không bao gồm transaction tự động từ fixed)
  const currentMonthDailyExpenses = state.transactions
    .filter((tx) => tx.date.startsWith(currentMonthKey) && tx.type !== 'income' && !tx.isRecurringInstance)
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Tổng tiền thực tế ĐÃ CHI tháng này = Tiền cố định đã đóng + Chi tiêu hàng ngày
  const totalActualSpentThisMonth = currentMonthFixedPaid + currentMonthDailyExpenses;

  // Dư khả dụng thực tế hiện tại = Thu nhập tháng - Tổng đã chi thực tế
  const monthlySavingsActual = Math.max(0, totalMonthlyIncome - totalActualSpentThisMonth);

  // Tính chi phí cố định bình quân hàng tháng (tiền trọ chia đều 3 tháng)
  const averageMonthlyFixed = state.recurringExpenses.reduce((sum, item) => {
    if (item.cycle === 'quarterly') return sum + item.amount / 3;
    return sum + item.amount;
  }, 0);

  // Tính chi phí phát sinh thực tế trong tháng:
  // Nếu đã có giao dịch chi tiêu trong tháng, tính dự phóng chi tiêu cả tháng theo tốc độ chi thực tế
  const now = new Date();
  const currentDay = Math.max(1, now.getDate());
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  
  // Chi tiêu phát sinh dự kiến cả tháng:
  // Nếu đã chi X đồng trong currentDay ngày -> trung bình mỗi ngày chi (X / currentDay) -> cả tháng là (X / currentDay) * daysInMonth
  // Nếu chưa phát sinh giao dịch nào trong tháng thì lấy mặc định ngân sách sinh hoạt cơ bản (Ăn uống 1.5tr + nhu yếu phẩm 800k = 2.3tr)
  const projectedDailyExpense = currentMonthDailyExpenses > 0
    ? Math.max(currentMonthDailyExpenses, Math.round((currentMonthDailyExpenses / currentDay) * daysInMonth))
    : 2300000;

  // Mức trích quỹ khẩn cấp hàng tháng
  const monthlyEmergencyAllocation = state.emergencyFund?.monthlyAllocation ?? 200000;

  // Tiền dư tích lũy dự kiến cho mục tiêu lớn = Tổng thu nhập tháng - Chi phí cố định bình quân - Chi phí phát sinh thực tế - Trích quỹ khẩn cấp
  const estimatedAverageMonthlySavings = Math.max(
    0,
    totalMonthlyIncome - averageMonthlyFixed - projectedDailyExpense - monthlyEmergencyAllocation
  );

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col justify-between selection:bg-zinc-800">
      {/* Top Header - High-Contrast Hairline Monochrome */}
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-zinc-900 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white font-mono font-bold text-sm tracking-tighter">
              MS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-white tracking-tight leading-none">MoneySaver</h1>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">PRO</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono mt-1">
                <span>Thu nhập: {formatVND(totalMonthlyIncome)}</span>
                {currentMonthExtraIncome > 0 && (
                  <span className="text-emerald-500 font-medium">
                    (+{formatVND(currentMonthExtraIncome)})
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Cloud Sync Status Indicator */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-950 border border-zinc-900 text-[11px] font-mono text-zinc-400"
              title={
                syncStatus === 'synced'
                  ? 'Đã đồng bộ thời gian thực với Cloud (Supabase)'
                  : syncStatus === 'syncing'
                  ? 'Đang đồng bộ...'
                  : 'Chế độ Offline / Chưa đồng bộ'
              }
            >
              {syncStatus === 'syncing' && (
                <>
                  <RefreshCw className="w-3 h-3 text-zinc-400 animate-spin" />
                  <span className="text-zinc-400 hidden sm:inline">Syncing</span>
                </>
              )}
              {syncStatus === 'synced' && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span className="text-zinc-300 hidden sm:inline">Synced</span>
                </>
              )}
              {syncStatus === 'offline' && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span>
                  <span className="text-zinc-500 hidden sm:inline">Offline</span>
                </>
              )}
            </div>

            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Cài đặt & Sao lưu"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 space-y-4 pb-24">
        {/* Metric Cards Tổng quan dòng tiền tháng - Hairline Monochrome Design */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-900 space-y-1.5">
            <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-mono font-medium block">
              Đã chi tháng {currentMonthKey}
            </span>
            <div className="text-xl font-bold font-mono text-white tracking-tight">
              {formatVND(totalActualSpentThisMonth)}
            </div>
            <div className="text-[10px] font-mono text-zinc-500 pt-0.5 border-t border-zinc-900">
              Cố định: {formatVND(currentMonthFixedPaid)}/{formatVND(currentMonthFixedDue)}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-900 space-y-1.5">
            <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-mono font-medium block">
              Dư khả dụng
            </span>
            <div className="text-xl font-bold font-mono text-white tracking-tight">
              {formatVND(monthlySavingsActual)}
            </div>
            <div className="text-[10px] font-mono text-zinc-500 pt-0.5 border-t border-zinc-900">
              Sẵn sàng cho: #{state.goals[0]?.name?.slice(0, 12) || 'Mục tiêu 1'}
            </div>
          </div>
        </div>

        {/* Tab Switch Views */}
        {activeTab === 'quick' && (
          <div className="space-y-4">
            <QuickNumpad
              categories={state.categories}
              onSave={(amount, groupId, subCategoryId, notes, type) =>
                addTransaction(amount, groupId, subCategoryId, notes, type)
              }
              onAddNewSubCategory={(groupId, name) => addSubCategory(groupId, name)}
            />

            {/* Lịch sử gần nhất ngay dưới bàn phím số */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-2 px-1">
                <span className="font-semibold text-zinc-300">Giao dịch gần đây</span>
                <button
                  onClick={() => setActiveTab('history')}
                  className="text-emerald-400 hover:underline"
                >
                  Xem tất cả ({state.transactions.length})
                </button>
              </div>
              <TransactionList
                transactions={state.transactions.slice(0, 3)}
                categories={state.categories}
                onDeleteTransaction={deleteTransaction}
              />
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <GoalsTracker
            goals={state.goals}
            monthlySalary={state.profile.monthlySalary}
            monthlySavingsEstimated={estimatedAverageMonthlySavings}
            currentMonthSpent={totalActualSpentThisMonth}
            projectedDailyExpense={projectedDailyExpense}
            onUpdateSalary={(newSalary) => updateProfile({ monthlySalary: newSalary })}
            onAddGoal={addGoal}
            onUpdateGoal={updateGoal}
            onDeleteGoal={deleteGoal}
          />
        )}

        {activeTab === 'emergency' && (
          <EmergencyFundManager
            emergencyFund={state.emergencyFund || DEFAULT_EMERGENCY_FUND}
            monthlySalary={state.profile.monthlySalary}
            onDeposit={depositEmergencyFund}
            onWithdraw={withdrawEmergencyFund}
            onUpdateSettings={updateEmergencyFundSettings}
          />
        )}

        {activeTab === 'recurring' && (
          <RecurringManager
            recurringExpenses={state.recurringExpenses}
            categories={state.categories}
            onUpdateRecurring={updateRecurringExpense}
            onOverrideMonth={overrideRecurringMonth}
            onTogglePaid={toggleRecurringPaid}
          />
        )}

        {activeTab === 'history' && (
          <div className="space-y-3">
            <h2 className="text-base font-bold text-white">Lịch Sử Chi Tiêu Đầy Đủ</h2>
            <TransactionList
              transactions={state.transactions}
              categories={state.categories}
              onDeleteTransaction={deleteTransaction}
            />
          </div>
        )}
      </main>

      {/* Bottom Sticky Tab Navigation - Monochrome Hairline */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-md border-t border-zinc-900 py-2 px-2">
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('quick')}
            className={`flex flex-col items-center gap-1 py-1.5 rounded-lg text-[10px] font-mono transition-colors ${
              activeTab === 'quick' ? 'text-white font-bold bg-zinc-900' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Ghi nhanh</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('goals')}
            className={`flex flex-col items-center gap-1 py-1.5 rounded-lg text-[10px] font-mono transition-colors ${
              activeTab === 'goals' ? 'text-white font-bold bg-zinc-900' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Mục tiêu</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('emergency')}
            className={`flex flex-col items-center gap-1 py-1.5 rounded-lg text-[10px] font-mono transition-colors ${
              activeTab === 'emergency' ? 'text-white font-bold bg-zinc-900' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Khẩn cấp</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('recurring')}
            className={`flex flex-col items-center gap-1 py-1.5 rounded-lg text-[10px] font-mono transition-colors ${
              activeTab === 'recurring' ? 'text-white font-bold bg-zinc-900' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Cố định</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center gap-1 py-1.5 rounded-lg text-[10px] font-mono transition-colors ${
              activeTab === 'history' ? 'text-white font-bold bg-zinc-900' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Lịch sử</span>
          </button>
        </div>
      </nav>

      {/* Settings / Backup Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Sao Lưu & Cài Đặt
              </h3>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="text-xs text-zinc-500 hover:text-zinc-300"
              >
                Đóng
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Dữ liệu của bạn được lưu an toàn 100% trên trình duyệt (LocalStorage). Hãy tải file sao lưu JSON định kỳ để không lo mất dữ liệu khi đổi máy.
            </p>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={exportData}
                className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-zinc-700 transition-colors"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                Tải file sao lưu (JSON)
              </button>

              <label className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-zinc-700 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-blue-400" />
                <span>Khôi phục từ file JSON</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const content = event.target?.result as string;
                        if (content && importData(content)) {
                          alert('Khôi phục dữ liệu thành công!');
                          setShowSettingsModal(false);
                        } else {
                          alert('File sao lưu không hợp lệ!');
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Bạn có chắc chắn muốn cài đặt lại từ đầu (mở lại Onboarding)?')) {
                    resetAllData();
                    setShowSettingsModal(false);
                  }
                }}
                className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-rose-500/20 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Đặt lại từ đầu (Onboarding)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
