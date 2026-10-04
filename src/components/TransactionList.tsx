import React, { useState } from 'react';
import { Transaction, CategoryGroup } from '../types';
import { formatVND, formatDisplayDate } from '../utils/formatters';
import { DynamicIcon } from './DynamicIcon';
import { Search, Trash2, Calendar, ChevronDown, ChevronRight, ArrowDownLeft, ArrowUpRight, ArrowUpDown, AlertTriangle, X } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  categories: CategoryGroup[];
  onDeleteTransaction: (id: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories,
  onDeleteTransaction,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});
  const [deleteConfirmTx, setDeleteConfirmTx] = useState<Transaction | null>(null);
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  // Lọc giao dịch
  const filtered = transactions.filter((tx) => {
    if (filterType === 'expense' && tx.type === 'income') return false;
    if (filterType === 'income' && tx.type !== 'income') return false;
    if (filterGroup !== 'all' && tx.groupId !== filterGroup) return false;
    if (searchTerm) {
      const matchName = tx.subCategoryName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchNotes = tx.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchName || matchNotes;
    }
    return true;
  });

  // Nhóm theo từng tháng (YYYY-MM)
  const groupedByMonth = filtered.reduce<Record<string, Transaction[]>>((acc, tx) => {
    const monthKey = tx.date ? tx.date.slice(0, 7) : 'Khác';
    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(tx);
    return acc;
  }, {});

  const sortedMonthKeys = Object.keys(groupedByMonth).sort((a, b) => {
    return sortOrder === 'desc' ? b.localeCompare(a) : a.localeCompare(b);
  });

  const toggleMonth = (monthKey: string) => {
    setExpandedMonths((prev) => ({
      ...prev,
      [monthKey]: !prev[monthKey],
    }));
  };

  return (
    <div className="space-y-4">
      {/* Bộ Lọc & Tìm Kiếm */}
      <div className="space-y-2">
        {/* Tab Lọc: Tất cả / Khoản chi / Thu nhập */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => setFilterType('expense')}
            className={`py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
              filterType === 'expense'
                ? 'bg-white text-rose-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-rose-500" />
            <span>Khoản chi</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType('income')}
            className={`py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
              filterType === 'income'
                ? 'bg-white text-emerald-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
            <span>Thu thêm</span>
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo cơm trưa, cà phê, xà phòng, áo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 shadow-xs transition-all"
          />
        </div>

        <div className="flex gap-2">
          {/* Lọc theo danh mục */}
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-600 shadow-xs"
          >
            <option value="all">Tất cả danh mục</option>
            <option value="food">Ăn uống</option>
            <option value="supplies">Nhu yếu phẩm</option>
            <option value="decor">Decor</option>
            <option value="clothing">Quần áo</option>
            <option value="tech">Công nghệ</option>
            <option value="transport">Đi lại</option>
            <option value="other">Khác</option>
            <option value="living">Phòng trọ & Cố định</option>
            <option value="income_group">Thu nhập thêm (+)</option>
          </select>

          {/* Sort theo tháng */}
          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span>{sortOrder === 'desc' ? 'Mới nhất' : 'Cũ nhất'}</span>
          </button>
        </div>
      </div>

      {/* Hiển Thị Lịch Sử Theo Từng Tháng */}
      {sortedMonthKeys.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-600">Không tìm thấy giao dịch nào</p>
          <p className="text-[11px] text-slate-400 mt-1">Dùng bàn phím số để ghi nhanh khoản chi hoặc thu nhập nhé!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedMonthKeys.map((monthKey) => {
            const list = groupedByMonth[monthKey];
            const isExpanded = expandedMonths[monthKey] ?? true;

            const monthExpense = list
              .filter((tx) => tx.type !== 'income')
              .reduce((sum, tx) => sum + tx.amount, 0);
            const monthIncome = list
              .filter((tx) => tx.type === 'income')
              .reduce((sum, tx) => sum + tx.amount, 0);

            return (
              <div
                key={monthKey}
                className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden transition-all"
              >
                {/* Header Tháng - Hiển thị rõ cả Thu và Chi */}
                <button
                  type="button"
                  onClick={() => toggleMonth(monthKey)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="text-slate-400">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span>Tháng {monthKey}</span>
                        <span className="text-[11px] text-slate-400 font-normal">
                          ({list.length} giao dịch)
                        </span>
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right tabular-nums">
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-900">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Chi</span>
                        <span>{formatVND(monthExpense)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                        <span className="text-[10px] font-semibold text-emerald-600/70 uppercase tracking-wider">Thu</span>
                        <span>+{formatVND(monthIncome)}</span>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Danh Sách Chi Tiết Từng Giao Dịch Trong Tháng */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-slate-100 space-y-1">
                    {list.map((tx) => {
                      const group = categories.find((c) => c.id === tx.groupId);
                      const isIncome = tx.type === 'income';
                      const isExpandedNote = expandedTxId === tx.id;

                      return (
                        <div
                          key={tx.id}
                          className="rounded-xl bg-slate-50/70 border border-slate-200/70 hover:border-slate-300 hover:bg-white transition-all overflow-hidden"
                        >
                          <div
                            onClick={() => setExpandedTxId(isExpandedNote ? null : tx.id)}
                            className="flex items-center justify-between gap-3 p-2.5 cursor-pointer select-none"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                isIncome
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                  : 'bg-white border border-slate-200 text-slate-700 shadow-2xs'
                              }`}>
                                {isIncome ? (
                                  <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                                ) : (
                                  <DynamicIcon
                                    name={
                                      tx.groupId === 'supplies' || group?.id === 'supplies'
                                        ? 'Package'
                                        : group?.icon === 'Sparkles'
                                        ? 'Package'
                                        : group?.icon || 'CircleDot'
                                    }
                                    className="w-4 h-4"
                                  />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
                                  <span className="truncate">{tx.subCategoryName}</span>
                                  {isIncome && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/60 shrink-0">
                                      Thu thêm
                                    </span>
                                  )}
                                  {tx.isRecurringInstance && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-medium shrink-0">
                                      Cố định
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 overflow-hidden">
                                  <span className="shrink-0 tabular-nums">{formatDisplayDate(tx.date)}</span>
                                  <span className="shrink-0">•</span>
                                  <span className="shrink-0 tabular-nums">{tx.time}</span>
                                  {tx.notes && !isExpandedNote && (
                                    <>
                                      <span className="shrink-0">•</span>
                                      <span className="text-slate-600 italic truncate max-w-[120px] sm:max-w-[200px]">
                                        "{tx.notes}"
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className={`text-xs font-bold tabular-nums whitespace-nowrap ${
                                  isIncome ? 'text-emerald-700' : 'text-slate-900'
                                }`}
                              >
                                {isIncome ? '+' : '-'}{formatVND(tx.amount)}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirmTx(tx);
                                }}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Xóa giao dịch này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Chi tiết ghi chú */}
                          {isExpandedNote && tx.notes && (
                            <div className="px-3.5 py-2 bg-white border-t border-slate-100 text-xs text-slate-700">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                                Ghi chú chi tiết:
                              </span>
                              <p className="whitespace-pre-wrap break-words">{tx.notes}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pop-up xác nhận xóa giao dịch */}
      {deleteConfirmTx && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xs w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Xác nhận xóa giao dịch?</h3>
                <p className="text-xs text-slate-500">Hành động này không thể hoàn tác.</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Hạng mục:</span>
                <span className="font-semibold text-slate-800">{deleteConfirmTx.subCategoryName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Số tiền:</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {deleteConfirmTx.type === 'income' ? '+' : '-'}{formatVND(deleteConfirmTx.amount)}
                </span>
              </div>
              {deleteConfirmTx.notes && (
                <div className="flex justify-between items-center text-xs pt-0.5">
                  <span className="text-slate-500">Ghi chú:</span>
                  <span className="text-slate-700 italic truncate max-w-[140px]">"{deleteConfirmTx.notes}"</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1 text-xs">
              <button
                type="button"
                onClick={() => setDeleteConfirmTx(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteTransaction(deleteConfirmTx.id);
                  setDeleteConfirmTx(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs transition-colors"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
