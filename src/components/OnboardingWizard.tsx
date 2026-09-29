import React, { useState } from 'react';
import { RecurringExpense, FinancialGoal, DueOption } from '../types';
import { formatVND, formatDueText, formatNumberWithCommas } from '../utils/formatters';
import { ChevronRight, Sparkles, Plus, Trash2, ArrowLeft, Wallet } from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: (salary: number, recurring: RecurringExpense[], goals: FinancialGoal[]) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const [salary, setSalary] = useState<number>(8000000);
  const [recurringList, setRecurringList] = useState<RecurringExpense[]>([]);
  const [goalsList, setGoalsList] = useState<FinancialGoal[]>([]);

  // Thêm khoản chi cố định mới
  const [newRecName, setNewRecName] = useState('');
  const [newRecAmount, setNewRecAmount] = useState('');
  const [newRecCycle, setNewRecCycle] = useState<'monthly' | 'quarterly'>('monthly');
  const [newDueOption, setNewDueOption] = useState<DueOption>('end_of_month');
  const [newAnchorMonth, setNewAnchorMonth] = useState<string>('2026-10');

  // Thêm mục tiêu mới
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalAmount, setNewGoalAmount] = useState('');

  const handleAddRecurring = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecName || !newRecAmount) return;
    const amountNum = Number(newRecAmount.replace(/\D/g, ''));
    if (isNaN(amountNum) || amountNum <= 0) return;

    setRecurringList([
      ...recurringList,
      {
        id: 'rec_' + Date.now(),
        name: newRecName,
        subCategoryId: 'utilities',
        amount: amountNum,
        cycle: newRecCycle,
        dueOption: newDueOption,
        anchorMonth: newRecCycle === 'quarterly' ? newAnchorMonth : undefined,
      },
    ]);
    setNewRecName('');
    setNewRecAmount('');
  };

  const handleRemoveRecurring = (id: string) => {
    setRecurringList(recurringList.filter((r) => r.id !== id));
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalName || !newGoalAmount) return;
    const amountNum = Number(newGoalAmount.replace(/\D/g, ''));
    if (isNaN(amountNum) || amountNum <= 0) return;

    setGoalsList([
      ...goalsList,
      {
        id: 'goal_' + Date.now(),
        name: newGoalName,
        icon: 'Target',
        targetAmount: amountNum,
        currentAmount: 0,
        priority: goalsList.length + 1,
      },
    ]);
    setNewGoalName('');
    setNewGoalAmount('');
  };

  const handleRemoveGoal = (id: string) => {
    setGoalsList(goalsList.filter((g) => g.id !== id));
  };

  const totalMonthlyFixed = recurringList.reduce((sum, item) => {
    if (item.cycle === 'quarterly') {
      return sum + item.amount / 3;
    }
    return sum + item.amount;
  }, 0);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-3 sm:p-6 text-slate-800">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-8 flex flex-col justify-between min-h-[580px]">
        {/* Header & Step Bar */}
        <div>
          <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
                <Wallet className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-slate-900 leading-none">MoneySaver</h1>
                <p className="text-xs text-slate-500 mt-1">Khởi tạo kế hoạch tài chính</p>
              </div>
            </div>

            {/* Step Pills */}
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    s === step
                      ? 'w-7 bg-emerald-600'
                      : s < step
                      ? 'w-2.5 bg-emerald-300'
                      : 'w-2.5 bg-slate-200'
                  }`}
                  aria-label={`Bước ${s}`}
                />
              ))}
              <span className="text-xs font-semibold text-slate-600 ml-1.5 tabular-nums">
                {step}/3
              </span>
            </div>
          </div>

          {/* STEP 1: Thu nhập */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                  01 • Thu nhập cố định
                </span>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Mức lương hàng tháng của bạn?</h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Nhập mức lương cố định nhận hàng tháng.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-4">
                <label className="text-xs font-semibold text-slate-600 block">Lương cố định (VNĐ)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={salary.toLocaleString('vi-VN')}
                    onChange={(e) => {
                      const val = Number(e.target.value.replace(/\D/g, ''));
                      setSalary(isNaN(val) ? 0 : val);
                    }}
                    className="w-full bg-white border border-slate-300/80 rounded-xl px-4 py-3 text-2xl font-bold text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 tabular-nums shadow-xs transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-lg">
                    ₫
                  </span>
                </div>

                {/* Quick Select Buttons */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {[6000000, 8000000, 10000000, 12000000].map((quick) => (
                    <button
                      key={quick}
                      type="button"
                      onClick={() => setSalary(quick)}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                        salary === quick
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100/50'
                      }`}
                    >
                      {quick / 1000000}tr
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Chi cố định */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 border border-sky-200/60 px-2.5 py-0.5 rounded-full">
                  02 • Chi phí cố định
                </span>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Các khoản chi định kỳ</h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Thiết lập hạn đóng (đầu tháng / cuối tháng) và chu kỳ thanh toán linh hoạt.
                </p>
              </div>

              {/* Danh sách khoản cố định tự tạo */}
              {recurringList.length === 0 ? (
                <div className="p-6 rounded-2xl border border-dashed border-slate-200 text-center space-y-1 bg-slate-50/50">
                  <p className="text-xs font-semibold text-slate-700">Chưa có khoản chi định kỳ nào</p>
                  <p className="text-[11px] text-slate-500">
                    Điền tên và số tiền bên dưới để thêm các khoản chi của bạn (tiền trọ, điện nước, xe...).
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {recurringList.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-colors"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{item.name}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-semibold text-slate-900 tabular-nums">{formatVND(item.amount)}</span>
                          <span>•</span>
                          <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                            {formatDueText(item)}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveRecurring(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Xóa khoản này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Form thêm nhanh khoản mới */}
              <form onSubmit={handleAddRecurring} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="text-xs font-bold text-slate-700">Thêm khoản chi định kỳ:</div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Tên khoản (VD: Tiền nhà)"
                    value={newRecName}
                    onChange={(e) => setNewRecName(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10"
                  />
                  <input
                    type="text"
                    placeholder="Số tiền (VD: 3,000,000)"
                    value={newRecAmount}
                    onChange={(e) => setNewRecAmount(formatNumberWithCommas(e.target.value))}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 tabular-nums"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newDueOption}
                    onChange={(e) => setNewDueOption(e.target.value as DueOption)}
                    className="bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-700 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="end_of_month">Cuối tháng</option>
                    <option value="start_of_month">Đầu tháng</option>
                  </select>

                  <select
                    value={newRecCycle}
                    onChange={(e) => setNewRecCycle(e.target.value as 'monthly' | 'quarterly')}
                    className="bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-700 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="monthly">Đóng hàng tháng</option>
                    <option value="quarterly">3 tháng đóng 1 lần</option>
                  </select>
                </div>

                {newRecCycle === 'quarterly' && (
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="shrink-0 text-[11px] font-medium">Bắt đầu từ:</span>
                    <input
                      type="month"
                      value={newAnchorMonth}
                      onChange={(e) => setNewAnchorMonth(e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newRecName || !newRecAmount}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-xs disabled:opacity-40 transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm khoản
                  </button>
                </div>
              </form>

              {/* Tóm tắt quy đổi */}
              {recurringList.length > 0 && (
                <div className="p-3 rounded-xl bg-sky-50/80 border border-sky-200/70 text-xs text-sky-800 flex items-center justify-between">
                  <span className="font-medium">Ước tính cố định quy đổi / tháng:</span>
                  <span className="font-bold text-slate-900 tabular-nums">{formatVND(Math.round(totalMonthlyFixed))}</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Mục tiêu lớn */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-full">
                  03 • Mục tiêu tích lũy
                </span>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Thứ tự ưu tiên tích lũy</h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Tiền dư mỗi tháng sẽ tự động dồn lần lượt theo thứ tự ưu tiên các mục tiêu do bạn thiết lập.
                </p>
              </div>

              {goalsList.length === 0 ? (
                <div className="p-6 rounded-2xl border border-dashed border-slate-200 text-center space-y-1 bg-slate-50/50">
                  <p className="text-xs font-semibold text-slate-700">Chưa có mục tiêu nào</p>
                  <p className="text-[11px] text-slate-500">
                    Thêm mục tiêu bạn muốn tích lũy bên dưới, hoặc bấm bắt đầu để thêm sau trong ứng dụng.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {goalsList.map((g, idx) => (
                    <div
                      key={g.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/60 flex items-center justify-center text-xs font-bold tabular-nums">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="text-sm font-semibold text-slate-800">{g.name}</div>
                          <div className="text-xs text-slate-500 tabular-nums">Dự toán: <strong className="text-slate-800">{formatVND(g.targetAmount)}</strong></div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveGoal(g.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Xóa mục tiêu"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Form thêm mục tiêu mới */}
              <form onSubmit={handleAddGoal} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="text-xs font-bold text-slate-700">Thêm mục tiêu mới:</div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Tên mục tiêu (VD: Quỹ du lịch)"
                    value={newGoalName}
                    onChange={(e) => setNewGoalName(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10"
                  />
                  <input
                    type="text"
                    placeholder="Dự toán (VD: 10,000,000)"
                    value={newGoalAmount}
                    onChange={(e) => setNewGoalAmount(formatNumberWithCommas(e.target.value))}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 tabular-nums"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newGoalName || !newGoalAmount}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-xs disabled:opacity-40 transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm mục tiêu
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-sm transition-all"
            >
              Tiếp tục
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onComplete(salary, recurringList, goalsList)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Bắt đầu quản lý
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
