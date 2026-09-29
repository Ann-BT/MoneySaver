import React, { useState } from 'react';
import { FinancialGoal } from '../types';
import { formatVND, formatNumberWithCommas, formatMonthsForecast } from '../utils/formatters';
import { Target, TrendingUp, Calendar, ArrowUp, ArrowDown, Plus, Sparkles, Check, X } from 'lucide-react';

interface GoalsTrackerProps {
  goals: FinancialGoal[];
  monthlySalary: number;
  monthlySavingsEstimated: number; // Tiền dư ước tính hàng tháng (đã trừ chi phí phát sinh thực tế)
  currentMonthSpent: number; // Tổng chi tiêu thực tế đã ghi nhận trong tháng
  projectedDailyExpense: number; // Dự phóng chi tiêu phát sinh tháng này
  onUpdateSalary: (newSalary: number) => void;
  onAddGoal: (goal: Omit<FinancialGoal, 'id'>) => void;
  onUpdateGoal: (id: string, updates: Partial<FinancialGoal>) => void;
  onDeleteGoal: (id: string) => void;
}

export const GoalsTracker: React.FC<GoalsTrackerProps> = ({
  goals,
  monthlySalary,
  monthlySavingsEstimated,
  currentMonthSpent,
  projectedDailyExpense,
  onUpdateSalary,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
}) => {
  const [isEditingSalary, setIsEditingSalary] = useState<boolean>(false);
  const [salaryInput, setSalaryInput] = useState<string>(monthlySalary.toString());
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newGoalName, setNewGoalName] = useState<string>('');
  const [newGoalTarget, setNewGoalTarget] = useState<string>('');

  // Tốc độ tích lũy thực tế dựa trên lương và chi tiêu cố định
  const effectiveMonthlyRate = Math.max(100000, monthlySavingsEstimated);

  // Sắp xếp các mục tiêu theo thứ tự ưu tiên
  const sortedGoals = [...goals].sort((a, b) => a.priority - b.priority);

  // Thuật toán mục tiêu xếp tầng (Priority Cascading):
  let cumulativeMonths = 0;
  const goalForecasts = sortedGoals.map((g) => {
    const remainingToSave = Math.max(0, g.targetAmount - g.currentAmount);
    const monthsNeededForThisGoal = remainingToSave / effectiveMonthlyRate;
    const finishMonthAccumulated = cumulativeMonths + monthsNeededForThisGoal;
    cumulativeMonths = finishMonthAccumulated;

    const percent = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));

    return {
      goal: g,
      percent,
      remainingToSave,
      monthsForGoal: Math.ceil(monthsNeededForThisGoal),
      totalMonthsFromNow: Math.ceil(finishMonthAccumulated),
    };
  });

  const handleSaveSalary = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(salaryInput.replace(/\D/g, ''));
    if (!isNaN(num) && num > 0) {
      onUpdateSalary(num);
      setIsEditingSalary(false);
    }
  };

  const handleSwapPriority = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sortedGoals.length) return;

    const currentGoal = sortedGoals[index];
    const targetGoal = sortedGoals[targetIndex];

    onUpdateGoal(currentGoal.id, { priority: targetGoal.priority });
    onUpdateGoal(targetGoal.id, { priority: currentGoal.priority });
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalName.trim() || !newGoalTarget) return;
    const targetNum = Number(newGoalTarget.replace(/\D/g, ''));
    if (isNaN(targetNum) || targetNum <= 0) return;

    onAddGoal({
      name: newGoalName.trim(),
      icon: 'Target',
      targetAmount: targetNum,
      currentAmount: 0,
      priority: goals.length + 1,
    });

    setNewGoalName('');
    setNewGoalTarget('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Mục Tiêu & Dự Toán Tích Lũy
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dòng tiền dồn lần lượt theo thứ tự ưu tiên
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Thêm mục tiêu</span>
        </button>
      </div>

      {/* Thẻ Quản lý Lương & Tích lũy */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold block">
              Lương cơ bản hàng tháng
            </span>
            {!isEditingSalary ? (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-base font-extrabold text-slate-900 tabular-nums">
                  {formatVND(monthlySalary)}
                </span>
                <button
                  onClick={() => {
                    setSalaryInput(monthlySalary.toString());
                    setIsEditingSalary(true);
                  }}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                >
                  Sửa
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveSalary} className="flex items-center gap-1.5 mt-1">
                <input
                  type="text"
                  value={salaryInput}
                  onChange={(e) => setSalaryInput(e.target.value)}
                  autoFocus
                  className="w-28 px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-xs hover:bg-emerald-700 cursor-pointer"
                >
                  Lưu
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingSalary(false)}
                  className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Hủy
                </button>
              </form>
            )}
          </div>
          <div className="text-right">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold block">
              Tích lũy thực tế
            </span>
            <span className="text-base font-extrabold text-emerald-600 tabular-nums">
              {formatVND(effectiveMonthlyRate)}/tháng
            </span>
          </div>
        </div>

        {/* Thông tin dòng tiền động theo thực tế */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 tabular-nums">
          <span>Đã chi tháng này: <strong className="text-slate-800">{formatVND(currentMonthSpent)}</strong></span>
          <span>Dự kiến cả tháng: <strong className="text-slate-800">~{formatVND(projectedDailyExpense)}</strong></span>
        </div>
      </div>

      {/* Danh sách mục tiêu xếp tầng */}
      <div className="space-y-2.5">
        {goalForecasts.map(({ goal, percent, remainingToSave, totalMonthsFromNow }, idx) => {
          return (
            <div
              key={goal.id}
              className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs tabular-nums shadow-xs">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      {goal.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                      Dự toán: <strong className="text-slate-800">{formatVND(goal.targetAmount)}</strong>
                    </p>
                  </div>
                </div>

                {/* Thứ tự ưu tiên */}
                <div className="flex items-center gap-1">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleSwapPriority(idx, 'up')}
                    className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 disabled:opacity-25 text-slate-600 transition-colors"
                    title="Ưu tiên cao hơn"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={idx === goalForecasts.length - 1}
                    onClick={() => handleSwapPriority(idx, 'down')}
                    className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 disabled:opacity-25 text-slate-600 transition-colors"
                    title="Ưu tiên thấp hơn"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Thanh tiến độ */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs tabular-nums">
                  <span className="text-slate-500">Đã tích: <strong className="text-slate-800">{formatVND(goal.currentAmount)}</strong></span>
                  <span className="text-emerald-700 font-bold">{percent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              {/* Dự báo thời gian cán đích */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
                <span className="font-medium">Dự kiến hoàn thành:</span>
                <span className="text-slate-900 font-bold flex items-center gap-1.5 tabular-nums">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  {formatMonthsForecast(totalMonthsFromNow)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Thêm Mục Tiêu Mới */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateGoal}
            className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Thêm Mục Tiêu Mới</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Tên mục tiêu:</label>
              <input
                type="text"
                placeholder="VD: Mua điện thoại mới, Du lịch..."
                value={newGoalName}
                onChange={(e) => setNewGoalName(e.target.value)}
                autoFocus
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Số tiền dự kiến (VNĐ):</label>
              <input
                type="text"
                placeholder="VD: 15,000,000"
                value={newGoalTarget}
                onChange={(e) => setNewGoalTarget(formatNumberWithCommas(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs tabular-nums text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={!newGoalName.trim() || !newGoalTarget}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs disabled:opacity-40 transition-colors shadow-sm"
            >
              Thêm vào danh sách ưu tiên
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
