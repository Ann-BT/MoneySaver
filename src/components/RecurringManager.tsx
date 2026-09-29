import React, { useState } from 'react';
import { RecurringExpense, CategoryGroup, DueOption } from '../types';
import { formatVND, getCurrentMonthKey, formatDueText, formatNumberWithCommas, parseNumberFromCommas, isRecurringDueInMonth } from '../utils/formatters';
import { DynamicIcon } from './DynamicIcon';
import { Edit3, Check, AlertCircle, Home, CheckCircle2, Circle, Eye, EyeOff } from 'lucide-react';

interface RecurringManagerProps {
  recurringExpenses: RecurringExpense[];
  categories: CategoryGroup[];
  onUpdateRecurring: (id: string, updates: Partial<RecurringExpense>) => void;
  onOverrideMonth: (id: string, monthKey: string, amount: number) => void;
  onTogglePaid: (id: string, monthKey: string) => void;
}

export const RecurringManager: React.FC<RecurringManagerProps> = ({
  recurringExpenses,
  categories,
  onUpdateRecurring,
  onOverrideMonth,
  onTogglePaid,
}) => {
  const currentMonthKey = getCurrentMonthKey();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPriceVal, setEditPriceVal] = useState<string>('');
  const [isPermanent, setIsPermanent] = useState<boolean>(false);
  const [editDueOption, setEditDueOption] = useState<DueOption>('end_of_month');
  const [editAnchorMonth, setEditAnchorMonth] = useState<string>('2026-10');
  const [showAllItems, setShowAllItems] = useState<boolean>(false);

  const startEdit = (item: RecurringExpense) => {
    setEditingId(item.id);
    const effectiveAmount = item.monthlyOverrides?.[currentMonthKey] ?? item.amount;
    setEditPriceVal(formatNumberWithCommas(effectiveAmount));
    setIsPermanent(false);
    setEditDueOption(item.dueOption || 'end_of_month');
    setEditAnchorMonth(item.anchorMonth || currentMonthKey);
  };

  const handleSaveEdit = (item: RecurringExpense) => {
    const newAmount = parseNumberFromCommas(editPriceVal);
    if (newAmount <= 0) return;

    if (isPermanent) {
      // Đổi giá gốc và hạn đóng vĩnh viễn (khi chuyển trọ giá mới)
      onUpdateRecurring(item.id, {
        amount: newAmount,
        dueOption: editDueOption,
        anchorMonth: editAnchorMonth,
      });
    } else {
      // Chỉ đổi tháng này (ví dụ điện nước tháng này rẻ hơn)
      onOverrideMonth(item.id, currentMonthKey, newAmount);
    }
    setEditingId(null);
  };

  // Chỉ lấy những khoản đến hạn trong tháng này
  const dueItemsThisMonth = recurringExpenses.filter((item) => isRecurringDueInMonth(item, currentMonthKey));
  const notDueItemsThisMonth = recurringExpenses.filter((item) => !isRecurringDueInMonth(item, currentMonthKey));
  const itemsToDisplay = showAllItems ? recurringExpenses : dueItemsThisMonth;

  // Tổng số tiền đến hạn tháng này
  const totalDueThisMonth = dueItemsThisMonth.reduce((sum, item) => {
    const effective = item.monthlyOverrides?.[currentMonthKey] ?? item.amount;
    return sum + effective;
  }, 0);

  // Tổng số tiền ĐÃ ĐÓNG tháng này
  const totalPaidThisMonth = dueItemsThisMonth
    .filter((item) => Boolean(item.paidMonths?.[currentMonthKey]))
    .reduce((sum, item) => {
      const effective = item.monthlyOverrides?.[currentMonthKey] ?? item.amount;
      return sum + effective;
    }, 0);

  return (
    <div className="space-y-4">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight uppercase font-mono">
            Chi Phí Cố Định
          </h2>
          <p className="text-xs text-zinc-400">
            Hạn đóng linh hoạt (Đầu tháng / Cuối tháng / Chu kỳ)
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-mono text-zinc-500 block">Dự chi {currentMonthKey}</span>
          <span className="text-sm font-bold font-mono text-zinc-100">{formatVND(totalDueThisMonth)}</span>
        </div>
      </div>

      {/* Thanh tiến độ thanh toán - Tối giản, không dải màu lòe loẹt */}
      <div className="p-3 rounded-xl bg-black border border-zinc-900 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400 font-mono text-[11px] uppercase tracking-wider">
            Tiến độ thanh toán tháng {currentMonthKey}
          </span>
          <span className="font-mono text-xs font-semibold text-zinc-200">
            <span className="text-emerald-500 font-bold">{formatVND(totalPaidThisMonth)}</span> / {formatVND(totalDueThisMonth)}
          </span>
        </div>
        <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300 rounded-full"
            style={{
              width: `${totalDueThisMonth > 0 ? Math.min(100, Math.round((totalPaidThisMonth / totalDueThisMonth) * 100)) : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Thông báo đến hạn tiền nhà */}
      {dueItemsThisMonth.some(item => item.cycle === 'quarterly') && (
        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-zinc-300 shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <div className="font-medium text-zinc-100">Đến kỳ đóng tiền nhà 3 tháng (3.900.000 ₫)</div>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              Kỳ đóng này rơi vào cuối tháng {currentMonthKey}. Đánh dấu hoàn tất sau khi bạn đã chuyển khoản.
            </p>
          </div>
        </div>
      )}

      {/* Danh sách thẻ khoản chi */}
      <div className="grid grid-cols-1 gap-2">
        {itemsToDisplay.map((item) => {
          const hasOverride = item.monthlyOverrides && item.monthlyOverrides[currentMonthKey] !== undefined;
          const currentAmount = hasOverride ? item.monthlyOverrides![currentMonthKey] : item.amount;
          const isQuarterly = item.cycle === 'quarterly';
          const isDue = isRecurringDueInMonth(item, currentMonthKey);
          const isPaid = Boolean(item.paidMonths?.[currentMonthKey]);

          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border transition-all space-y-2.5 ${
                isPaid
                  ? 'bg-zinc-950/40 border-zinc-900'
                  : !isDue
                  ? 'bg-zinc-950/20 border-zinc-900 opacity-60'
                  : 'bg-black border-zinc-900 hover:border-zinc-800'
              }`}
            >
              {/* Header card: Checkbox + Tên + Số tiền + Nút Edit */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Nút Tick Đã Đóng */}
                  <button
                    type="button"
                    onClick={() => onTogglePaid(item.id, currentMonthKey)}
                    className={`w-6 h-6 rounded-md border transition-all flex items-center justify-center shrink-0 ${
                      isPaid
                        ? 'bg-white text-black border-white'
                        : 'bg-zinc-950 border-zinc-800 text-transparent hover:border-zinc-600'
                    }`}
                    title={isPaid ? 'Đánh dấu Chưa đóng' : 'Đánh dấu Đã đóng'}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </button>

                  <div className="min-w-0">
                    <h3 className={`text-xs font-medium truncate ${isPaid ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                      {item.name}
                    </h3>
                    <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                      {formatDueText(item)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="text-right">
                    <div className={`text-sm font-bold font-mono tracking-tight ${isPaid ? 'text-zinc-400' : 'text-zinc-100'}`}>
                      {formatVND(currentAmount)}
                    </div>
                    {isQuarterly && (
                      <div className="text-[10px] font-mono text-zinc-600">
                        (~{formatVND(Math.round(currentAmount / 3))}/tháng)
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 text-zinc-400 hover:text-white transition-colors"
                    title="Chỉnh sửa số tiền & hạn đóng"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Dải trạng thái / Badge ngăn nắp bên dưới */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5 border-t border-zinc-900/60">
                {isPaid && (
                  <span className="text-[10px] font-mono text-emerald-500 flex items-center gap-1">
                    ✓ Đã thanh toán tháng {currentMonthKey}
                  </span>
                )}
                {!isDue && (
                  <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                    • Chưa đến hạn trong tháng này
                  </span>
                )}
                {hasOverride && (
                  <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                    • Đã điều chỉnh riêng tháng này
                  </span>
                )}
              </div>

              {/* Box sửa giá và hạn đóng */}
              {editingId === item.id && (
                <div className="pt-3 border-t border-zinc-800 space-y-3 animate-in fade-in duration-150">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] text-zinc-400">Số tiền (VNĐ):</label>
                      <input
                        type="text"
                        value={editPriceVal}
                        onChange={(e) => setEditPriceVal(formatNumberWithCommas(e.target.value))}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-zinc-400">Thời điểm đóng tiền:</label>
                      <select
                        value={editDueOption}
                        onChange={(e) => setEditDueOption(e.target.value as DueOption)}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-2 py-2 text-xs text-zinc-200 focus:outline-none"
                      >
                        <option value="start_of_month">Đầu tháng</option>
                        <option value="end_of_month">Cuối tháng</option>
                      </select>
                    </div>
                  </div>

                  {isQuarterly && (
                    <div className="space-y-1">
                      <label className="text-[11px] text-zinc-400">Tháng mốc bắt đầu đóng (YYYY-MM):</label>
                      <input
                        type="month"
                        value={editAnchorMonth}
                        onChange={(e) => setEditAnchorMonth(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                      />
                      <span className="text-[10px] text-zinc-500">
                        Ví dụ chọn tháng 10/2026 thì app tự tính hạn tiếp theo là 01/2027, 04/2027...
                      </span>
                    </div>
                  )}

                  {/* Nút lưu */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(item)}
                      className="flex-1 py-2 bg-blue-500 hover:bg-blue-400 text-zinc-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Lưu thay đổi
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-3 py-2 text-zinc-500 hover:text-zinc-300 text-xs"
                    >
                      Hủy
                    </button>
                  </div>
                  
                  {/* Tùy chọn phạm vi sửa */}
                  <div className="flex items-center gap-4 text-xs text-zinc-400 pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name={`edit-scope-${item.id}`}
                        checked={!isPermanent}
                        onChange={() => setIsPermanent(false)}
                        className="text-blue-500 focus:ring-0"
                      />
                      <span>Chỉ áp dụng tháng này</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-amber-300">
                      <input
                        type="radio"
                        name={`edit-scope-${item.id}`}
                        checked={isPermanent}
                        onChange={() => setIsPermanent(true)}
                        className="text-amber-500 focus:ring-0"
                      />
                      <span>Đổi vĩnh viễn</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tùy chọn xem các khoản chi thuộc tháng khác (chưa đến hạn) */}
      {notDueItemsThisMonth.length > 0 && (
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => setShowAllItems(!showAllItems)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {showAllItems ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-zinc-500" />
                <span>Chỉ hiện các khoản đến hạn tháng này ({dueItemsThisMonth.length})</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                <span>Xem tất cả chi phí cố định (bao gồm {notDueItemsThisMonth.length} khoản chưa đến hạn)</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
