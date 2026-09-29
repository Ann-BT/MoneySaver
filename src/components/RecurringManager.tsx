import React, { useState } from 'react';
import { RecurringExpense, CategoryGroup, DueOption } from '../types';
import { formatVND, getCurrentMonthKey, formatDueText, formatNumberWithCommas, parseNumberFromCommas, isRecurringDueInMonth } from '../utils/formatters';
import { DynamicIcon } from './DynamicIcon';
import { Edit3, Check, AlertCircle, Home, CheckCircle2, Circle, Eye, EyeOff, X } from 'lucide-react';

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
      onUpdateRecurring(item.id, {
        amount: newAmount,
        dueOption: editDueOption,
        anchorMonth: editAnchorMonth,
      });
    } else {
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
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Chi Phí Cố Định
          </h2>
          <p className="text-xs text-slate-500">
            Theo dõi kỳ thanh toán và đánh dấu khi hoàn tất
          </p>
        </div>
        <div className="text-right">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold block">
            Dự chi tháng {currentMonthKey}
          </span>
          <span className="text-base font-extrabold text-slate-900 tabular-nums">
            {formatVND(totalDueThisMonth)}
          </span>
        </div>
      </div>

      {/* Thanh tiến độ thanh toán */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600 font-semibold">
            Tiến độ thanh toán tháng {currentMonthKey}
          </span>
          <span className="font-semibold text-slate-900 tabular-nums">
            <span className="text-emerald-700 font-bold">{formatVND(totalPaidThisMonth)}</span> / {formatVND(totalDueThisMonth)}
          </span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
            style={{
              width: `${totalDueThisMonth > 0 ? Math.min(100, Math.round((totalPaidThisMonth / totalDueThisMonth) * 100)) : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Thông báo đến hạn tiền nhà */}
      {dueItemsThisMonth.some((item) => item.cycle === 'quarterly') && (
        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <div className="font-bold text-amber-900">Đến kỳ đóng tiền nhà 3 tháng (3.900.000 ₫)</div>
            <p className="text-amber-800 leading-relaxed text-[11px]">
              Kỳ đóng này rơi vào cuối tháng {currentMonthKey}. Đánh dấu hoàn tất sau khi bạn đã chuyển khoản.
            </p>
          </div>
        </div>
      )}

      {/* Danh sách thẻ khoản chi */}
      <div className="grid grid-cols-1 gap-2.5">
        {itemsToDisplay.map((item) => {
          const hasOverride = item.monthlyOverrides && item.monthlyOverrides[currentMonthKey] !== undefined;
          const currentAmount = hasOverride ? item.monthlyOverrides![currentMonthKey] : item.amount;
          const isQuarterly = item.cycle === 'quarterly';
          const isDue = isRecurringDueInMonth(item, currentMonthKey);
          const isPaid = Boolean(item.paidMonths?.[currentMonthKey]);

          return (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all space-y-3 ${
                isPaid
                  ? 'bg-slate-50/80 border-slate-200 opacity-80'
                  : !isDue
                  ? 'bg-slate-50/50 border-slate-200/60 opacity-60'
                  : 'bg-white border-slate-200/90 shadow-xs hover:border-slate-300'
              }`}
            >
              {/* Header card: Checkbox + Tên + Số tiền + Nút Edit */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Nút Tick Đã Đóng */}
                  <button
                    type="button"
                    onClick={() => onTogglePaid(item.id, currentMonthKey)}
                    className={`w-6 h-6 rounded-lg border transition-all flex items-center justify-center shrink-0 ${
                      isPaid
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white border-slate-300 text-transparent hover:border-slate-400'
                    }`}
                    title={isPaid ? 'Đánh dấu Chưa đóng' : 'Đánh dấu Đã đóng'}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>

                  <div className="min-w-0">
                    <h3 className={`text-sm font-semibold truncate ${isPaid ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatDueText(item)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="text-right">
                    <div className={`text-sm font-bold tabular-nums tracking-tight ${isPaid ? 'text-slate-400' : 'text-slate-900'}`}>
                      {formatVND(currentAmount)}
                    </div>
                    {isQuarterly && (
                      <div className="text-[11px] text-slate-500 tabular-nums">
                        (~{formatVND(Math.round(currentAmount / 3))}/tháng)
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
                    title="Chỉnh sửa số tiền & hạn đóng"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Dải trạng thái / Badge ngăn nắp bên dưới */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
                {isPaid && (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                    ✓ Đã thanh toán tháng {currentMonthKey}
                  </span>
                )}
                {!isDue && (
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    • Chưa đến hạn trong tháng này
                  </span>
                )}
                {hasOverride && (
                  <span className="text-[11px] font-medium text-sky-700 bg-sky-50 border border-sky-200/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                    • Đã điều chỉnh riêng tháng này
                  </span>
                )}
              </div>

              {/* Box sửa giá và hạn đóng */}
              {editingId === item.id && (
                <div className="pt-3 border-t border-slate-200 space-y-3 animate-in fade-in duration-150">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Số tiền (VNĐ):</label>
                      <input
                        type="text"
                        value={editPriceVal}
                        onChange={(e) => setEditPriceVal(formatNumberWithCommas(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600 tabular-nums"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Thời điểm đóng tiền:</label>
                      <select
                        value={editDueOption}
                        onChange={(e) => setEditDueOption(e.target.value as DueOption)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                      >
                        <option value="start_of_month">Đầu tháng</option>
                        <option value="end_of_month">Cuối tháng</option>
                      </select>
                    </div>
                  </div>

                  {isQuarterly && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Tháng mốc bắt đầu đóng (YYYY-MM):</label>
                      <input
                        type="month"
                        value={editAnchorMonth}
                        onChange={(e) => setEditAnchorMonth(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                      />
                      <span className="text-[11px] text-slate-500 block">
                        Ví dụ: Chọn 2026-10 thì hạn tiếp theo là 2027-01, 2027-04...
                      </span>
                    </div>
                  )}

                  {/* Nút lưu */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(item)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      Lưu thay đổi
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-3 py-2 text-slate-500 hover:text-slate-800 text-xs font-medium"
                    >
                      Hủy
                    </button>
                  </div>
                  
                  {/* Tùy chọn phạm vi sửa */}
                  <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name={`edit-scope-${item.id}`}
                        checked={!isPermanent}
                        onChange={() => setIsPermanent(false)}
                        className="text-emerald-600 focus:ring-0"
                      />
                      <span>Chỉ áp dụng tháng này</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-amber-700 font-medium">
                      <input
                        type="radio"
                        name={`edit-scope-${item.id}`}
                        checked={isPermanent}
                        onChange={() => setIsPermanent(true)}
                        className="text-amber-600 focus:ring-0"
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

      {/* Tùy chọn xem các khoản chi thuộc tháng khác */}
      {notDueItemsThisMonth.length > 0 && (
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => setShowAllItems(!showAllItems)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:text-slate-900 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            {showAllItems ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                <span>Chỉ hiện các khoản đến hạn tháng này ({dueItemsThisMonth.length})</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                <span>Xem tất cả chi phí ({notDueItemsThisMonth.length} khoản chưa đến hạn)</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
