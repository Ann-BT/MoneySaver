import React, { useState } from 'react';
import { useAppState } from './hooks/useAppState';
import { OnboardingWizard } from './components/OnboardingWizard';
import { QuickNumpad } from './components/QuickNumpad';
import { RecurringManager } from './components/RecurringManager';
import { GoalsTracker } from './components/GoalsTracker';
import { TransactionList } from './components/TransactionList';
import { EmergencyFundManager } from './components/EmergencyFundManager';
import { DEFAULT_EMERGENCY_FUND } from './data/defaultData';
import { formatVND, getCurrentMonthKey, isRecurringDueInMonth, formatNumberWithCommas, parseNumberFromCommas } from './utils/formatters';
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
  RefreshCw,
  SlidersHorizontal,
  X,
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
  const [settingsSalary, setSettingsSalary] = useState<string>('');
  const [salarySavedMessage, setSalarySavedMessage] = useState<boolean>(false);

  // Cập nhật giá trị lương khi mở modal hoặc khi profile thay đổi
  React.useEffect(() => {
    if (state.profile?.monthlySalary) {
      setSettingsSalary(formatNumberWithCommas(state.profile.monthlySalary));
    }
  }, [state.profile?.monthlySalary, showSettingsModal]);

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

  // Tính tổng các giao dịch chi tiêu hàng ngày
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

  // Tính chi phí phát sinh thực tế trong tháng
  const now = new Date();
  const currentDay = Math.max(1, now.getDate());
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  
  const projectedDailyExpense = currentMonthDailyExpenses > 0
    ? Math.max(currentMonthDailyExpenses, Math.round((currentMonthDailyExpenses / currentDay) * daysInMonth))
    : 2300000;

  // Mức trích quỹ khẩn cấp hàng tháng
  const monthlyEmergencyAllocation = state.emergencyFund?.monthlyAllocation ?? 200000;

  // Tiền dư tích lũy dự kiến cho mục tiêu lớn
  const estimatedAverageMonthlySavings = Math.max(
    0,
    totalMonthlyIncome - averageMonthlyFixed - projectedDailyExpense - monthlyEmergencyAllocation
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Header - Modern Clean FinTech */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Wallet className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-none">MoneySaver</h1>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                  PRO
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 tabular-nums">
                <span>Lương: <strong className="text-slate-800">{formatVND(totalMonthlyIncome)}</strong></span>
                {currentMonthExtraIncome > 0 && (
                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded text-[11px]">
                    (+{formatVND(currentMonthExtraIncome)})
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Cloud Sync Status Indicator */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-[11px] font-medium text-slate-600 shadow-2xs"
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
                  <RefreshCw className="w-3 h-3 text-emerald-600 animate-spin" />
                  <span className="hidden sm:inline">Syncing</span>
                </>
              )}
              {syncStatus === 'synced' && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span className="hidden sm:inline">Synced</span>
                </>
              )}
              {syncStatus === 'offline' && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  <span className="hidden sm:inline">Offline</span>
                </>
              )}
            </div>

            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 transition-colors"
              title="Cài đặt & Sao lưu"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 space-y-4 pb-24">
        {/* Metric Cards Tổng quan dòng tiền tháng */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1.5">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold block">
              Đã chi tháng {currentMonthKey}
            </span>
            <div className="text-xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {formatVND(totalActualSpentThisMonth)}
            </div>
            <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 tabular-nums">
              Cố định: {formatVND(currentMonthFixedPaid)}/{formatVND(currentMonthFixedDue)}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1.5">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold block">
              Dư khả dụng
            </span>
            <div className="text-xl font-extrabold text-emerald-600 tracking-tight tabular-nums">
              {formatVND(monthlySavingsActual)}
            </div>
            <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 truncate">
              Dồn cho: <strong className="text-slate-700">#{state.goals[0]?.name || 'Mục tiêu 1'}</strong>
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
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2.5 px-1">
                <span className="font-bold text-slate-800">Giao dịch gần đây</span>
                <button
                  onClick={() => setActiveTab('history')}
                  className="font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
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
            <h2 className="text-base font-bold text-slate-900">Lịch Sử Chi Tiêu Đầy Đủ</h2>
            <TransactionList
              transactions={state.transactions}
              categories={state.categories}
              onDeleteTransaction={deleteTransaction}
            />
          </div>
        )}
      </main>

      {/* Bottom Sticky Tab Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-slate-200 py-1.5 px-3 shadow-lg shadow-slate-200/50">
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('quick')}
            className={`flex flex-col items-center gap-1 py-1.5 rounded-xl text-[10px] font-semibold transition-all ${
              activeTab === 'quick'
                ? 'text-emerald-800 font-bold bg-emerald-50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Zap className="w-4 h-4 stroke-[2.2]" />
            <span>Ghi nhanh</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('goals')}
            className={`flex flex-col items-center gap-1 py-1.5 rounded-xl text-[10px] font-semibold transition-all ${
              activeTab === 'goals'
                ? 'text-emerald-800 font-bold bg-emerald-50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Target className="w-4 h-4 stroke-[2.2]" />
            <span>Mục tiêu</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('emergency')}
            className={`flex flex-col items-center gap-1 py-1.5 rounded-xl text-[10px] font-semibold transition-all ${
              activeTab === 'emergency'
                ? 'text-emerald-800 font-bold bg-emerald-50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4 stroke-[2.2]" />
            <span>Khẩn cấp</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('recurring')}
            className={`flex flex-col items-center gap-1 py-1.5 rounded-xl text-[10px] font-semibold transition-all ${
              activeTab === 'recurring'
                ? 'text-emerald-800 font-bold bg-emerald-50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Home className="w-4 h-4 stroke-[2.2]" />
            <span>Cố định</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center gap-1 py-1.5 rounded-xl text-[10px] font-semibold transition-all ${
              activeTab === 'history'
                ? 'text-emerald-800 font-bold bg-emerald-50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4 stroke-[2.2]" />
            <span>Lịch sử</span>
          </button>
        </div>
      </nav>

      {/* Settings / Backup Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Sao Lưu & Cài Đặt
              </h3>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Dữ liệu của bạn được lưu an toàn trên trình duyệt và tự động đồng bộ lên Supabase Cloud.
            </p>

            {/* Điều chỉnh Lương cố định */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Mức lương hàng tháng:</label>
                {salarySavedMessage && (
                  <span className="text-[11px] font-semibold text-emerald-600 animate-in fade-in">
                    ✓ Đã cập nhật!
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={settingsSalary}
                  onChange={(e) => setSettingsSalary(formatNumberWithCommas(e.target.value))}
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600 tabular-nums shadow-2xs"
                  placeholder="VD: 8,000,000"
                />
                <button
                  type="button"
                  onClick={() => {
                    const num = parseNumberFromCommas(settingsSalary);
                    if (num > 0) {
                      updateProfile({ monthlySalary: num });
                      setSalarySavedMessage(true);
                      setTimeout(() => setSalarySavedMessage(false), 2000);
                    }
                  }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
                >
                  Cập nhật
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={exportData}
                className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-200 transition-colors"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                Tải file sao lưu (JSON)
              </button>

              <label className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-200 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-sky-600" />
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
                className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-rose-200 transition-colors"
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
