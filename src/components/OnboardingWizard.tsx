import React, { useState } from 'react';
import { RecurringExpense, FinancialGoal, DueOption } from '../types';
import { INITIAL_RECURRING_EXPENSES, INITIAL_GOALS } from '../data/defaultData';
import { formatVND, formatDueText, formatNumberWithCommas } from '../utils/formatters';
import { ChevronRight, ShieldCheck, Sparkles, Plus, Trash2 } from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: (salary: number, recurring: RecurringExpense[], goals: FinancialGoal[]) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const [salary, setSalary] = useState<number>(8000000);
  const [recurringList, setRecurringList] = useState<RecurringExpense[]>(INITIAL_RECURRING_EXPENSES);
  const [goalsList, setGoalsList] = useState<FinancialGoal[]>(INITIAL_GOALS);

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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between px-4 py-8 max-w-lg mx-auto selection:bg-emerald-500/30">
      {/* Header & Steps */}
      <div>
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-900">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h1 className="text-xl font-bold tracking-tight text-white">MoneySaver Setup</h1>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">Khởi tạo kế hoạch tài chính cá nhân</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full text-zinc-300">
            <span>Bước {step}</span>
            <span className="text-zinc-600">/</span>
            <span>3</span>
          </div>
        </div>

        {/* Step 1: Lương hiện tại */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs uppercase font-mono tracking-wider text-emerald-400">01. Thu nhập</span>
              <h2 className="text-2xl font-bold text-white tracking-tight">Mức lương hàng tháng của bạn?</h2>
              <p className="text-sm text-zinc-400">
                Nhập mức lương cố định nhận hàng tháng. Hiện tại bạn đang thử việc (8.000.000 ₫).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <label className="text-xs font-medium text-zinc-400 block">Lương cố định (VNĐ)</label>
              <div className="relative">
                <input
                  type="text"
                  value={salary.toLocaleString('vi-VN')}
                  onChange={(e) => {
                    const val = Number(e.target.value.replace(/\D/g, ''));
                    setSalary(isNaN(val) ? 0 : val);
                  }}
                  className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl px-4 py-3.5 text-2xl font-semibold text-emerald-400 focus:outline-none focus:border-emerald-500 font-mono tracking-tight"
                />
              </div>

              <div className="flex gap-2">
                {[6000000, 8000000, 10000000, 12000000].map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => setSalary(quick)}
                    className={`flex-1 py-1.5 text-xs font-mono rounded-lg border transition-colors ${
                      salary === quick
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 font-semibold'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    {quick / 1000000}tr
                  </button>
                ))}
              </div>

              <div className="pt-2 text-xs text-zinc-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Không có thưởng hay nợ nần, ngân sách sẽ dồn thẳng vào mục tiêu.</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Khoản chi cố định & Chu kỳ */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs uppercase font-mono tracking-wider text-blue-400">02. Chi cố định</span>
              <h2 className="text-2xl font-bold text-white tracking-tight">Các khoản chi định kỳ hàng tháng</h2>
              <p className="text-sm text-zinc-400">
                Thiết lập hạn đóng (đầu tháng / cuối tháng) và chu kỳ thanh toán linh hoạt.
              </p>
            </div>

            {/* Danh sách khoản cố định */}
            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {recurringList.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80"
                >
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium text-zinc-200">{item.name}</div>
                    <div className="text-xs text-zinc-400 flex items-center gap-2">
                      <span className="font-mono text-zinc-300 font-medium">{formatVND(item.amount)}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-medium">
                        {formatDueText(item)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveRecurring(item.id)}
                    className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Form thêm nhanh khoản mới */}
            <form onSubmit={handleAddRecurring} className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
              <div className="text-xs font-semibold text-zinc-300">Thêm khoản chi cố định khác:</div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Tên khoản (VD: Giặt sấy)"
                  value={newRecName}
                  onChange={(e) => setNewRecName(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
                />
                <input
                  type="text"
                  placeholder="Số tiền (VD: 150,000)"
                  value={newRecAmount}
                  onChange={(e) => setNewRecAmount(formatNumberWithCommas(e.target.value))}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newDueOption}
                  onChange={(e) => setNewDueOption(e.target.value as DueOption)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none"
                >
                  <option value="end_of_month">Cuối tháng</option>
                  <option value="start_of_month">Đầu tháng</option>
                </select>

                <select
                  value={newRecCycle}
                  onChange={(e) => setNewRecCycle(e.target.value as 'monthly' | 'quarterly')}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none"
                >
                  <option value="monthly">Đóng hàng tháng</option>
                  <option value="quarterly">3 tháng đóng 1 lần</option>
                </select>
              </div>

              {newRecCycle === 'quarterly' && (
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span className="shrink-0 text-[11px]">Bắt đầu từ:</span>
                  <input
                    type="month"
                    value={newAnchorMonth}
                    onChange={(e) => setNewAnchorMonth(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-xs font-mono text-white"
                  />
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newRecName || !newRecAmount}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold rounded-lg text-xs disabled:opacity-40 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm
                </button>
              </div>
            </form>

            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-center justify-between font-mono">
              <span>Ước tính cố định quy đổi / tháng:</span>
              <span className="font-semibold text-white">{formatVND(Math.round(totalMonthlyFixed))}</span>
            </div>
          </div>
        )}

        {/* Step 3: Các mục tiêu lớn (Laptop, Ô tô, Thạc sĩ) */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs uppercase font-mono tracking-wider text-amber-400">03. Mục tiêu lớn</span>
              <h2 className="text-2xl font-bold text-white tracking-tight">Thứ tự ưu tiên tích lũy</h2>
              <p className="text-sm text-zinc-400">
                Toàn bộ tiền dư hàng tháng sẽ ưu tiên dồn vào mục tiêu #1 (Máy tính), sau khi đủ tiền sẽ tiếp tục dồn sang mục tiêu tiếp theo.
              </p>
            </div>

            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {goalsList.map((g, idx) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-zinc-800 text-amber-400 border border-zinc-700 flex items-center justify-center font-mono text-xs font-bold">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-zinc-100">{g.name}</div>
                      <div className="text-xs font-mono text-zinc-400">Dự toán: {formatVND(g.targetAmount)}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveGoal(g.id)}
                    className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Form thêm mục tiêu mới */}
            <form onSubmit={handleAddGoal} className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
              <div className="text-xs font-semibold text-zinc-300">Thêm mục tiêu mới:</div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Tên mục tiêu (VD: Quỹ du lịch)"
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
                />
                <input
                  type="text"
                  placeholder="Dự toán (VD: 10000000)"
                  value={newGoalAmount}
                  onChange={(e) => setNewGoalAmount(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newGoalName || !newGoalAmount}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold rounded-lg text-xs disabled:opacity-40 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm mục tiêu
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Footer Navigation Buttons */}
      <div className="pt-6 border-t border-zinc-900 flex items-center justify-between">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 text-sm font-medium transition-colors"
          >
            Quay lại
          </button>
        ) : (
          <div></div>
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-sm font-semibold transition-colors"
          >
            Tiếp tục
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onComplete(salary, recurringList, goalsList)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Vào ứng dụng ngay
          </button>
        )}
      </div>
    </div>
  );
};
