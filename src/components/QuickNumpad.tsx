import React, { useState } from 'react';
import { CategoryGroup, TransactionType } from '../types';
import { formatVND } from '../utils/formatters';
import { DynamicIcon } from './DynamicIcon';
import { Plus, Check, Delete, ArrowDownLeft, ArrowUpRight, X } from 'lucide-react';

interface QuickNumpadProps {
  categories: CategoryGroup[];
  onSave: (amount: number, groupId: string, subCategoryId: string, notes?: string, type?: TransactionType) => void;
  onAddNewSubCategory: (groupId: string, name: string) => string;
}

export const QuickNumpad: React.FC<QuickNumpadProps> = ({
  categories,
  onSave,
  onAddNewSubCategory,
}) => {
  const [txType, setTxType] = useState<TransactionType>('expense');
  const [displayValue, setDisplayValue] = useState<string>('0');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('food');
  const [selectedSubId, setSelectedSubId] = useState<string>('sub_food');
  const [notes, setNotes] = useState<string>('');
  const [showAddSubModal, setShowAddSubModal] = useState<boolean>(false);
  const [newSubName, setNewSubName] = useState<string>('');
  const [isSavedFeedback, setIsSavedFeedback] = useState<boolean>(false);

  // 6 Nhóm thường dùng
  const sixFrequentTags = [
    { id: 'sub_food', groupId: 'food', name: 'Ăn uống', icon: 'Utensils', defaultAmount: 50000 },
    { id: 'sub_supplies', groupId: 'supplies', name: 'Nhu yếu phẩm', icon: 'Package', defaultAmount: 40000 },
    { id: 'sub_decor', groupId: 'decor', name: 'Decor', icon: 'Paintbrush', defaultAmount: 100000 },
    { id: 'sub_clothing', groupId: 'clothing', name: 'Quần áo', icon: 'Shirt', defaultAmount: 150000 },
    { id: 'sub_tech', groupId: 'tech', name: 'Công nghệ', icon: 'Cpu', defaultAmount: 80000 },
    { id: 'sub_transport', groupId: 'transport', name: 'Đi lại', icon: 'Bike', defaultAmount: 30000 },
  ];

  const handleDigit = (digit: string) => {
    if (displayValue === '0') {
      setDisplayValue(digit);
    } else {
      if (displayValue.length < 9) {
        setDisplayValue(displayValue + digit);
      }
    }
  };

  const handleAddK = (thousands: number) => {
    const current = Number(displayValue) || 0;
    setDisplayValue(String(current + thousands));
  };

  const handleClear = () => {
    setDisplayValue('0');
  };

  const handleBackspace = () => {
    if (displayValue.length <= 1) {
      setDisplayValue('0');
    } else {
      setDisplayValue(displayValue.slice(0, -1));
    }
  };

  const handleSelectShortcut = (shortcut: typeof sixFrequentTags[0]) => {
    setSelectedGroupId(shortcut.groupId);
    setSelectedSubId(shortcut.id);
    if (displayValue === '0' && shortcut.defaultAmount) {
      setDisplayValue(String(shortcut.defaultAmount));
    }
  };

  const handleSave = () => {
    const amount = Number(displayValue);
    if (amount <= 0) return;

    onSave(
      amount,
      txType === 'income' ? 'income_group' : selectedGroupId,
      txType === 'income' ? 'extra_income' : selectedSubId,
      notes,
      txType
    );
    setIsSavedFeedback(true);
    setTimeout(() => {
      setIsSavedFeedback(false);
      setDisplayValue('0');
      setNotes('');
    }, 600);
  };

  const handleCreateSubCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;
    const newId = onAddNewSubCategory(selectedGroupId, newSubName.trim());
    setSelectedSubId(newId);
    setNewSubName('');
    setShowAddSubModal(false);
  };

  const currentAmountNum = Number(displayValue) || 0;

  return (
    <div className="flex flex-col bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-sm relative overflow-hidden">
      {/* Saved Animation Overlay */}
      {isSavedFeedback && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-200">
          <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>
          <span className="text-slate-900 font-bold text-sm mt-3">
            {txType === 'income' ? 'Đã ghi nhận thu nhập thêm!' : 'Đã lưu khoản chi tiêu!'}
          </span>
        </div>
      )}

      {/* Switch Chi Tiêu / Thu Nhập Thêm */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-2xl mb-3.5">
        <button
          type="button"
          onClick={() => setTxType('expense')}
          className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            txType === 'expense'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowDownLeft className="w-3.5 h-3.5 text-rose-500 stroke-[2.5]" />
          <span>Khoản chi</span>
        </button>
        <button
          type="button"
          onClick={() => setTxType('income')}
          className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            txType === 'income'
              ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
          <span>Thu nhập thêm</span>
        </button>
      </div>

      {/* Screen Display: Số tiền to rõ ràng */}
      <div className="px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-3.5 flex flex-col items-end justify-center">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {txType === 'income' ? 'Số tiền thu thêm' : 'Số tiền đã chi'}
        </span>
        <div className="text-3xl sm:text-4xl font-extrabold tabular-nums tracking-tight mt-0.5">
          <span className={txType === 'income' ? 'text-emerald-600' : 'text-slate-900'}>
            {txType === 'income' ? '+' : '-'}{formatVND(currentAmountNum)}
          </span>
        </div>
      </div>

      {/* 6 Nhóm Thường Dùng */}
      {txType === 'expense' && (
        <div className="mb-3.5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-600 px-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Nhóm thường dùng</span>
            <button
              onClick={() => setShowAddSubModal(true)}
              className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              <Plus className="w-3 h-3 stroke-[2.5]" />
              Thêm mục
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {sixFrequentTags.map((s) => {
              const isSelected = selectedGroupId === s.groupId;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSelectShortcut(s)}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500/20 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <DynamicIcon name={s.icon} className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-700' : 'text-slate-500'}`} />
                  <span className="truncate">{s.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Ghi chú nhanh */}
      <div className="mb-3.5">
        <input
          type="text"
          placeholder={txType === 'income' ? 'Nguồn thu (Freelance, bán đồ cũ, thưởng...)' : 'Ghi chú (cơm trưa, cà phê, xăng xe, áo thun...)'}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 font-medium transition-all"
        />
      </div>

      {/* Bàn Phím Số Tactile */}
      <div className="grid grid-cols-4 gap-1.5">
        <button
          type="button"
          onClick={() => handleDigit('1')}
          className="h-12 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-lg font-bold tabular-nums text-slate-800 active:scale-95 shadow-xs transition-transform"
        >
          1
        </button>
        <button
          type="button"
          onClick={() => handleDigit('2')}
          className="h-12 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-lg font-bold tabular-nums text-slate-800 active:scale-95 shadow-xs transition-transform"
        >
          2
        </button>
        <button
          type="button"
          onClick={() => handleDigit('3')}
          className="h-12 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-lg font-bold tabular-nums text-slate-800 active:scale-95 shadow-xs transition-transform"
        >
          3
        </button>
        <button
          type="button"
          onClick={() => handleAddK(10000)}
          className="h-12 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/70 text-xs font-bold text-emerald-800 active:scale-95 transition-transform"
        >
          +10k
        </button>

        <button
          type="button"
          onClick={() => handleDigit('4')}
          className="h-12 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-lg font-bold tabular-nums text-slate-800 active:scale-95 shadow-xs transition-transform"
        >
          4
        </button>
        <button
          type="button"
          onClick={() => handleDigit('5')}
          className="h-12 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-lg font-bold tabular-nums text-slate-800 active:scale-95 shadow-xs transition-transform"
        >
          5
        </button>
        <button
          type="button"
          onClick={() => handleDigit('6')}
          className="h-12 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-lg font-bold tabular-nums text-slate-800 active:scale-95 shadow-xs transition-transform"
        >
          6
        </button>
        <button
          type="button"
          onClick={() => handleAddK(30000)}
          className="h-12 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/70 text-xs font-bold text-emerald-800 active:scale-95 transition-transform"
        >
          +30k
        </button>

        <button
          type="button"
          onClick={() => handleDigit('7')}
          className="h-12 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-lg font-bold tabular-nums text-slate-800 active:scale-95 shadow-xs transition-transform"
        >
          7
        </button>
        <button
          type="button"
          onClick={() => handleDigit('8')}
          className="h-12 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-lg font-bold tabular-nums text-slate-800 active:scale-95 shadow-xs transition-transform"
        >
          8
        </button>
        <button
          type="button"
          onClick={() => handleDigit('9')}
          className="h-12 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-lg font-bold tabular-nums text-slate-800 active:scale-95 shadow-xs transition-transform"
        >
          9
        </button>
        <button
          type="button"
          onClick={() => handleAddK(50000)}
          className="h-12 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/70 text-xs font-bold text-emerald-800 active:scale-95 transition-transform"
        >
          +50k
        </button>

        <button
          type="button"
          onClick={handleClear}
          className="h-12 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 border border-slate-200/70 text-xs font-bold text-slate-600 active:scale-95 transition-transform"
        >
          C
        </button>
        <button
          type="button"
          onClick={() => handleDigit('0')}
          className="h-12 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-lg font-bold tabular-nums text-slate-800 active:scale-95 shadow-xs transition-transform"
        >
          0
        </button>
        <button
          type="button"
          onClick={() => {
            if (displayValue !== '0') handleDigit('000');
          }}
          className="h-12 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-xs font-bold text-slate-600 active:scale-95 shadow-xs transition-transform"
        >
          000
        </button>
        <button
          type="button"
          onClick={handleBackspace}
          className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200/70 text-slate-700 flex items-center justify-center active:scale-95 transition-transform"
          title="Xóa lùi"
        >
          <Delete className="w-4 h-4" />
        </button>
      </div>

      {/* Nút LƯU */}
      <button
        type="button"
        disabled={currentAmountNum <= 0}
        onClick={handleSave}
        className={`w-full mt-3.5 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-30 disabled:pointer-events-none shadow-sm ${
          txType === 'income'
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
            : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10'
        }`}
      >
        <Check className="w-4 h-4 stroke-[2.5]" />
        <span>{txType === 'income' ? 'Ghi nhận thu nhập' : 'Lưu khoản chi'}</span>
      </button>

      {/* Modal Thêm Hạng Mục Nhanh Tại Chỗ */}
      {showAddSubModal && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs z-40 p-4 flex flex-col justify-center animate-in fade-in duration-150">
          <form onSubmit={handleCreateSubCategory} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Thêm Hạng Mục Con Mới</h3>
              <button
                type="button"
                onClick={() => setShowAddSubModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Thuộc nhóm cha:</label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-600"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Tên hạng mục con:</label>
              <input
                type="text"
                placeholder="VD: Móc áo, Khung tranh, Chuột không dây..."
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                autoFocus
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={!newSubName.trim()}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs disabled:opacity-40 transition-colors shadow-sm"
            >
              Tạo và chọn ngay
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
