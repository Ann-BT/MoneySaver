import React, { useState } from 'react';
import { CategoryGroup, TransactionType } from '../types';
import { formatVND } from '../utils/formatters';
import { DynamicIcon } from './DynamicIcon';
import { Plus, Check, Delete, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

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

  // 6 Nhóm thường dùng chuẩn nhất theo yêu cầu: Ăn uống, Nhu yếu phẩm, Decor, Quần áo, Công nghệ, Đi lại
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
    <div className="flex flex-col bg-zinc-900/90 border border-zinc-800 rounded-3xl p-4 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      {/* Saved Animation Overlay */}
      {isSavedFeedback && (
        <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-md z-30 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-200">
          <div className="w-14 h-14 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center shadow-lg">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>
          <span className="text-white font-bold text-sm mt-2">
            {txType === 'income' ? 'Đã ghi nhận thu nhập thêm!' : 'Đã lưu khoản chi!'}
          </span>
        </div>
      )}

      {/* Switch Chi Tiêu / Thu Nhập Thêm - High Contrast Hairline */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-black rounded-xl border border-zinc-900 mb-3">
        <button
          type="button"
          onClick={() => setTxType('expense')}
          className={`py-2 rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all ${
            txType === 'expense'
              ? 'bg-zinc-900 text-white border border-zinc-800'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <ArrowDownLeft className="w-3.5 h-3.5 text-rose-500" />
          <span>Khoản chi</span>
        </button>
        <button
          type="button"
          onClick={() => setTxType('income')}
          className={`py-2 rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all ${
            txType === 'income'
              ? 'bg-zinc-900 text-white border border-zinc-800'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
          <span>+ Thu nhập thêm</span>
        </button>
      </div>

      {/* Screen Display: Số tiền to sắc nét */}
      <div className="px-4 py-3 rounded-xl bg-black border border-zinc-900 mb-3 flex flex-col items-end justify-center">
        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          {txType === 'income' ? 'Số tiền thu thêm' : 'Số tiền đã chi'}
        </span>
        <div className="text-3xl font-bold font-mono tracking-tight text-white flex items-baseline gap-1 mt-0.5">
          <span className={txType === 'income' ? 'text-emerald-400' : 'text-zinc-100'}>
            {txType === 'income' ? '+' : '-'}{formatVND(currentAmountNum)}
          </span>
        </div>
      </div>

      {/* 6 Nhóm Thường Dùng: Ăn uống, Nhu yếu phẩm, Decor, Quần áo, Công nghệ, Đi lại */}
      {txType === 'expense' && (
        <div className="mb-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-zinc-400 px-0.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">Nhóm thường dùng</span>
            <button
              onClick={() => setShowAddSubModal(true)}
              className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-white transition-colors"
            >
              <Plus className="w-3 h-3" />
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
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-medium border transition-all text-center ${
                    isSelected
                      ? 'bg-zinc-900 border-zinc-600 text-white'
                      : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  <DynamicIcon name={s.icon} className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-zinc-500'}`} />
                  <span className="whitespace-nowrap">{s.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Ghi chú nhanh */}
      <div className="mb-3">
        <input
          type="text"
          placeholder={txType === 'income' ? 'Nguồn thu (Freelance, bán đồ cũ, thưởng...)' : 'Ghi chú (cơm trưa, cà phê, xăng xe, áo thun...)'}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full bg-black border border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 font-normal transition-colors"
        />
      </div>

      {/* Bàn Phím Số - Tinh xảo kiểu Linear/Vercel */}
      <div className="grid grid-cols-4 gap-1.5">
        <button
          type="button"
          onClick={() => handleDigit('1')}
          className="h-11 rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 text-base font-medium font-mono text-zinc-200 active:scale-95 transition-transform"
        >
          1
        </button>
        <button
          type="button"
          onClick={() => handleDigit('2')}
          className="h-11 rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 text-base font-medium font-mono text-zinc-200 active:scale-95 transition-transform"
        >
          2
        </button>
        <button
          type="button"
          onClick={() => handleDigit('3')}
          className="h-11 rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 text-base font-medium font-mono text-zinc-200 active:scale-95 transition-transform"
        >
          3
        </button>
        <button
          type="button"
          onClick={() => handleAddK(10000)}
          className="h-11 rounded-lg bg-black border border-zinc-900 text-xs font-mono text-zinc-400 hover:text-white hover:border-zinc-800 active:scale-95 transition-transform"
        >
          +10k
        </button>

        <button
          type="button"
          onClick={() => handleDigit('4')}
          className="h-11 rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 text-base font-medium font-mono text-zinc-200 active:scale-95 transition-transform"
        >
          4
        </button>
        <button
          type="button"
          onClick={() => handleDigit('5')}
          className="h-11 rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 text-base font-medium font-mono text-zinc-200 active:scale-95 transition-transform"
        >
          5
        </button>
        <button
          type="button"
          onClick={() => handleDigit('6')}
          className="h-11 rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 text-base font-medium font-mono text-zinc-200 active:scale-95 transition-transform"
        >
          6
        </button>
        <button
          type="button"
          onClick={() => handleAddK(20000)}
          className="h-11 rounded-lg bg-black border border-zinc-900 text-xs font-mono text-zinc-400 hover:text-white hover:border-zinc-800 active:scale-95 transition-transform"
        >
          +20k
        </button>

        <button
          type="button"
          onClick={() => handleDigit('7')}
          className="h-11 rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 text-base font-medium font-mono text-zinc-200 active:scale-95 transition-transform"
        >
          7
        </button>
        <button
          type="button"
          onClick={() => handleDigit('8')}
          className="h-11 rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 text-base font-medium font-mono text-zinc-200 active:scale-95 transition-transform"
        >
          8
        </button>
        <button
          type="button"
          onClick={() => handleDigit('9')}
          className="h-11 rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 text-base font-medium font-mono text-zinc-200 active:scale-95 transition-transform"
        >
          9
        </button>
        <button
          type="button"
          onClick={() => handleAddK(50000)}
          className="h-11 rounded-lg bg-black border border-zinc-900 text-xs font-mono text-zinc-400 hover:text-white hover:border-zinc-800 active:scale-95 transition-transform"
        >
          +50k
        </button>

        <button
          type="button"
          onClick={handleClear}
          className="h-11 rounded-lg bg-black border border-zinc-900 text-xs font-mono text-zinc-500 hover:text-rose-400 hover:border-zinc-800 active:scale-95 transition-transform"
        >
          C
        </button>
        <button
          type="button"
          onClick={() => handleDigit('0')}
          className="h-11 rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 text-base font-medium font-mono text-zinc-200 active:scale-95 transition-transform"
        >
          0
        </button>
        <button
          type="button"
          onClick={() => {
            if (displayValue !== '0') handleDigit('000');
          }}
          className="h-11 rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 text-xs font-mono text-zinc-400 active:scale-95 transition-transform"
        >
          000
        </button>
        <button
          type="button"
          onClick={handleBackspace}
          className="h-11 rounded-lg bg-black border border-zinc-900 text-zinc-400 flex items-center justify-center hover:text-white hover:border-zinc-800 active:scale-95 transition-transform"
        >
          <Delete className="w-4 h-4" />
        </button>
      </div>

      {/* Nút LƯU - Dứt khoát, không gradient lòe loẹt */}
      <button
        type="button"
        disabled={currentAmountNum <= 0}
        onClick={handleSave}
        className={`w-full mt-3 py-3 rounded-xl text-xs font-mono uppercase tracking-wider font-bold flex items-center justify-center gap-2 active:scale-[0.99] transition-all disabled:opacity-30 disabled:pointer-events-none ${
          txType === 'income'
            ? 'bg-emerald-500 text-black hover:bg-emerald-400'
            : 'bg-white text-black hover:bg-zinc-200'
        }`}
      >
        <Check className="w-4 h-4 stroke-[2.5]" />
        <span>{txType === 'income' ? 'Ghi nhận thu nhập' : 'Lưu khoản chi'}</span>
      </button>

      {/* Modal Thêm Hạng Mục Nhanh Tại Chỗ */}
      {showAddSubModal && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-40 p-4 flex flex-col justify-center animate-in fade-in duration-150">
          <form onSubmit={handleCreateSubCategory} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Thêm Hạng Mục Con Mới</h3>
              <button
                type="button"
                onClick={() => setShowAddSubModal(false)}
                className="text-xs text-zinc-500 hover:text-zinc-300"
              >
                Đóng
              </button>
            </div>
            
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Thuộc nhóm cha:</label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Tên hạng mục con:</label>
              <input
                type="text"
                placeholder="VD: Móc áo, Khung tranh, Chuột không dây..."
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                autoFocus
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={!newSubName.trim()}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs disabled:opacity-40 transition-colors"
            >
              Tạo và chọn ngay
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
