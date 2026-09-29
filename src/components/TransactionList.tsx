import React, { useState } from 'react';
import { Transaction, CategoryGroup } from '../types';
import { formatVND, formatDisplayDate } from '../utils/formatters';
import { DynamicIcon } from './DynamicIcon';
import { Search, Trash2, Calendar, ChevronDown, ChevronRight, ArrowDownLeft, ArrowUpRight, ArrowUpDown, AlertTriangle } from 'lucide-react';

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
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // mới nhất hoặc cũ nhất
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});
  const [deleteConfirmTx, setDeleteConfirmTx] = useState<Transaction | null>(null);
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  // Lọc giao dịch
  const filtered = transactions.filter((tx) => {
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

  // Sắp xếp các tháng
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
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo cơm, nước, xà phòng, đi chơi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
          />
        </div>

        <div className="flex gap-2">
          {/* Lọc theo danh mục */}
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="flex-1 bg-zinc-900/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none"
          >
            <option value="all">Tất cả hạng mục</option>
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
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs text-zinc-300 hover:text-white transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sortOrder === 'desc' ? 'Mới nhất' : 'Cũ nhất'}</span>
          </button>
        </div>
      </div>

      {/* Hiển Thị Lịch Sử Theo Từng Tháng (Bấm vào mới bung chi tiết) */}
      {sortedMonthKeys.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-zinc-900/30 border border-zinc-800/50">
          <Calendar className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-xs text-zinc-400">Không tìm thấy giao dịch nào</p>
          <p className="text-[11px] text-zinc-500 mt-1">Dùng bàn phím số để ghi nhanh khoản chi hoặc thu nhập nhé!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedMonthKeys.map((monthKey) => {
            const list = groupedByMonth[monthKey];
            const isExpanded = expandedMonths[monthKey] ?? true; // Mặc định mở tháng gần nhất

            // Tính tổng chi và tổng thu thêm của tháng này
            const monthExpense = list
              .filter((tx) => tx.type !== 'income')
              .reduce((sum, tx) => sum + tx.amount, 0);
            const monthIncome = list
              .filter((tx) => tx.type === 'income')
              .reduce((sum, tx) => sum + tx.amount, 0);

            return (
              <div
                key={monthKey}
                className="rounded-xl bg-black border border-zinc-900 overflow-hidden transition-all"
              >
                {/* Header Tháng - Bấm vào để đóng/mở chi tiết */}
                <button
                  type="button"
                  onClick={() => toggleMonth(monthKey)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-zinc-950 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="text-zinc-500">
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-white flex items-center gap-2 font-mono">
                        <span>Tháng {monthKey}</span>
                        <span className="text-[10px] text-zinc-500 font-normal">
                          ({list.length})
                        </span>
                      </h3>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-mono font-medium text-zinc-200">
                      Chi: {formatVND(monthExpense)}
                    </div>
                    {monthIncome > 0 && (
                      <div className="text-[10px] font-mono text-emerald-500 font-medium">
                        + {formatVND(monthIncome)}
                      </div>
                    )}
                  </div>
                </button>

                {/* Danh Sách Chi Tiết Từng Giao Dịch Trong Tháng */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-zinc-900 space-y-1">
                    {list.map((tx) => {
                      const group = categories.find((c) => c.id === tx.groupId);
                      const isIncome = tx.type === 'income';
                      const isExpandedNote = expandedTxId === tx.id;

                      return (
                        <div
                          key={tx.id}
                          className="rounded-lg bg-zinc-950 border border-zinc-900 hover:border-zinc-800 transition-all overflow-hidden"
                        >
                          <div
                            onClick={() => setExpandedTxId(isExpandedNote ? null : tx.id)}
                            className="flex items-center justify-between gap-3 p-2.5 cursor-pointer select-none"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div className="w-7 h-7 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-zinc-400">
                                {isIncome ? (
                                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <DynamicIcon
                                    name={
                                      tx.groupId === 'supplies' || group?.id === 'supplies'
                                        ? 'Package'
                                        : group?.icon === 'Sparkles'
                                        ? 'Package'
                                        : group?.icon || 'CircleDot'
                                    }
                                    className="w-3.5 h-3.5"
                                  />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-medium text-zinc-200 flex items-center gap-1.5 flex-wrap">
                                  <span className="truncate">{tx.subCategoryName}</span>
                                  {isIncome && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 text-emerald-400 font-mono border border-zinc-800 shrink-0">
                                      Thu thêm
                                    </span>
                                  )}
                                  {tx.isRecurringInstance && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 font-mono border border-zinc-800 shrink-0">
                                      Cố định
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] font-mono text-zinc-500 flex items-center gap-1.5 mt-0.5 overflow-hidden">
                                  <span className="shrink-0">{formatDisplayDate(tx.date)}</span>
                                  <span className="shrink-0">•</span>
                                  <span className="shrink-0">{tx.time}</span>
                                  {tx.notes && !isExpandedNote && (
                                    <>
                                      <span className="shrink-0">•</span>
                                      <span className="text-zinc-400 italic truncate max-w-[120px] sm:max-w-[200px]">
                                        "{tx.notes}"
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className={`text-xs font-mono font-semibold whitespace-nowrap ${
                                  isIncome ? 'text-emerald-500' : 'text-zinc-200'
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
                                className="p-1 rounded-md text-zinc-600 hover:text-rose-400 hover:bg-zinc-900 transition-colors"
                                title="Xóa giao dịch này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Chi tiết ghi chú bung rộng khi bấm vào */}
                          {isExpandedNote && tx.notes && (
                            <div className="px-3 py-2 bg-black/60 border-t border-zinc-900/80 text-xs text-zinc-300 font-mono">
                              <span className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-0.5">Ghi chú chi tiết:</span>
                              <p className="text-zinc-300 whitespace-pre-wrap break-words">{tx.notes}</p>
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

      {/* Pop-up xác nhận xóa giao dịch - Clean Hairline Dialog */}
      {deleteConfirmTx && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-black border border-zinc-800 rounded-2xl max-w-xs w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 shrink-0">
                <AlertTriangle className="w-4 h-4 text-zinc-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Xác nhận xóa giao dịch?</h3>
                <p className="text-[11px] text-zinc-500">Hành động này không thể hoàn tác.</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-900 space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500">Hạng mục:</span>
                <span className="font-medium text-zinc-200">{deleteConfirmTx.subCategoryName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500">Số tiền:</span>
                <span className="font-mono font-semibold text-white">
                  {deleteConfirmTx.type === 'income' ? '+' : '-'}{formatVND(deleteConfirmTx.amount)}
                </span>
              </div>
              {deleteConfirmTx.notes && (
                <div className="flex justify-between items-center text-xs pt-0.5">
                  <span className="text-zinc-500">Ghi chú:</span>
                  <span className="text-zinc-400 italic truncate max-w-[140px]">"{deleteConfirmTx.notes}"</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1 font-mono text-xs">
              <button
                type="button"
                onClick={() => setDeleteConfirmTx(null)}
                className="flex-1 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium transition-colors border border-zinc-800"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteTransaction(deleteConfirmTx.id);
                  setDeleteConfirmTx(null);
                }}
                className="flex-1 py-2 rounded-lg bg-white hover:bg-zinc-200 text-black font-bold transition-colors"
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
