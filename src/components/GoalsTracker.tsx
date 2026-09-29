import React, { useState } from 'react';
import { FinancialGoal } from '../types';
import { formatVND } from '../utils/formatters';
import { DynamicIcon } from './DynamicIcon';
import { Target, TrendingUp, Calendar, ArrowUp, ArrowDown, Plus, Sparkles, Check } from 'lucide-react';

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
      {/* Header - Clean Monochrome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-mono uppercase tracking-wider text-zinc-300 font-semibold">
            Mục tiêu & Dự toán
          </h2>
          <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
            Dòng tiền dồn lần lượt theo thứ tự ưu tiên
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-lg text-[11px] font-mono font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm mục tiêu</span>
        </button>
      </div>

      {/* Thẻ Quản lý Lương & Tích lũy */}
      <div className="p-3.5 rounded-xl bg-black border border-zinc-900 font-mono space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-zinc-500 block">Lương cơ bản hàng tháng</span>
            {!isEditingSalary ? (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-bold text-white tracking-tight">{formatVND(monthlySalary)}</span>
                <button
                  onClick={() => {
                    setSalaryInput(monthlySalary.toString());
                    setIsEditingSalary(true);
                  }}
                  className="text-[11px] text-zinc-400 hover:text-white underline cursor-pointer"
                >
                  Đổi
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveSalary} className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={salaryInput}
                  onChange={(e) => setSalaryInput(e.target.value)}
                  autoFocus
                  className="w-28 px-2 py-1 bg-zinc-950 border border-zinc-700 rounded text-xs text-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-2 py-1 bg-white text-black text-[11px] font-semibold rounded cursor-pointer"
                >
                  Lưu
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingSalary(false)}
                  className="px-1.5 py-1 text-[11px] text-zinc-500 hover:text-zinc-300 cursor-pointer"
                >
                  Hủy
                </button>
              </form>
            )}
          </div>
          <div className="text-right">
            <span className="text-[11px] uppercase tracking-wider text-zinc-500 block">Tích lũy thực tế</span>
            <span className="text-sm font-bold text-white tracking-tight">{formatVND(effectiveMonthlyRate)}/tháng</span>
          </div>
        </div>

        {/* Thông tin dòng tiền động theo thực tế */}
        <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-[10px] text-zinc-500">
          <span>Đã chi tháng này: <span className="text-zinc-400">{formatVND(currentMonthSpent)}</span></span>
          <span>Dự kiến chi cả tháng: <span className="text-zinc-400">~{formatVND(projectedDailyExpense)}</span></span>
        </div>
      </div>

      {/* Danh sách mục tiêu xếp tầng */}
      <div className="space-y-2">
        {goalForecasts.map(({ goal, percent, remainingToSave, totalMonthsFromNow }, idx) => {
          return (
            <div
              key={goal.id}
              className="p-3.5 rounded-xl bg-black border border-zinc-900 hover:border-zinc-800 transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center justify-center font-bold text-xs font-mono">
                    #{idx + 1}
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white flex items-center gap-2">
                      {goal.name}
                    </h3>
                    <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                      Dự toán: <span className="text-zinc-300">{formatVND(goal.targetAmount)}</span>
                    </p>
                  </div>
                </div>

                {/* Thứ tự ưu tiên */}
                <div className="flex items-center gap-1">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleSwapPriority(idx, 'up')}
                    className="p-1 rounded-md bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 disabled:opacity-20 text-zinc-400"
                    title="Ưu tiên cao hơn"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    disabled={idx === goalForecasts.length - 1}
                    onClick={() => handleSwapPriority(idx, 'down')}
                    className="p-1 rounded-md bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 disabled:opacity-20 text-zinc-400"
                    title="Ưu tiên thấp hơn"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Thanh tiến độ */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-zinc-500">Đã tích: {formatVND(goal.currentAmount)}</span>
                  <span className="text-zinc-300 font-semibold">{percent}%</span>
                </div>
                <div className="w-full h-1 rounded-full bg-zinc-900 overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
              </div>

              {/* Dự báo thời gian cán đích */}
              <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-900 text-xs text-zinc-400 flex items-center justify-between font-mono text-[11px]">
                <span>Dự kiến hoàn thành:</span>
                <span className="text-zinc-200 font-medium flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-zinc-500" />
                  ~{totalMonthsFromNow} tháng nữa
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Thêm Mục Tiêu Mới */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateGoal}
            className="w-full max-w-sm bg-black border border-zinc-800 rounded-xl p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-white">Thêm Mục Tiêu Mới</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-xs text-zinc-500 hover:text-zinc-300"
              >
                Đóng
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-zinc-400">Tên mục tiêu:</label>
              <input
                type="text"
                placeholder="VD: Mua điện thoại mới, Du lịch..."
                value={newGoalName}
                onChange={(e) => setNewGoalName(e.target.value)}
                autoFocus
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-zinc-400">Số tiền dự kiến (VNĐ):</label>
              <input
                type="text"
                placeholder="VD: 15000000"
                value={newGoalTarget}
                onChange={(e) => setNewGoalTarget(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <button
              type="submit"
              disabled={!newGoalName.trim() || !newGoalTarget}
              className="w-full py-2 bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg text-xs disabled:opacity-30 transition-colors font-mono"
            >
              Thêm vào danh sách ưu tiên
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
