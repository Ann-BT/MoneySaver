import React, { useState } from 'react';
import { EmergencyFund } from '../types';
import { formatVND, formatDisplayDate, formatNumberWithCommas } from '../utils/formatters';
import { ShieldAlert, Plus, ArrowDownRight, ArrowUpRight, History, Settings2, AlertCircle, X } from 'lucide-react';

interface EmergencyFundManagerProps {
  emergencyFund: EmergencyFund;
  monthlySalary: number;
  onDeposit: (amount: number, reason: string) => void;
  onWithdraw: (amount: number, reason: string) => void;
  onUpdateSettings: (updates: Partial<Pick<EmergencyFund, 'monthlyAllocation' | 'targetAmount'>>) => void;
}

export const EmergencyFundManager: React.FC<EmergencyFundManagerProps> = ({
  emergencyFund,
  monthlySalary,
  onDeposit,
  onWithdraw,
  onUpdateSettings,
}) => {
  const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);
  const [showDepositModal, setShowDepositModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  // Form states
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawReason, setWithdrawReason] = useState<string>('');
  const [depositAmount, setDepositAmount] = useState<string>(formatNumberWithCommas(emergencyFund.monthlyAllocation.toString()));
  const [depositReason, setDepositReason] = useState<string>('Trích dự phòng tháng');

  const [editMonthlyAllocation, setEditMonthlyAllocation] = useState<string>(formatNumberWithCommas(emergencyFund.monthlyAllocation.toString()));
  const [editTargetAmount, setEditTargetAmount] = useState<string>(formatNumberWithCommas(emergencyFund.targetAmount.toString()));

  const percent = Math.min(100, Math.round((emergencyFund.currentBalance / emergencyFund.targetAmount) * 100));

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(withdrawAmount.replace(/\D/g, ''));
    if (isNaN(num) || num <= 0) return;
    if (num > emergencyFund.currentBalance) {
      alert('Số tiền rút vượt quá số dư hiện có trong Quỹ khẩn cấp!');
      return;
    }

    onWithdraw(num, withdrawReason.trim() || 'Rút tiền khẩn cấp');
    setWithdrawAmount('');
    setWithdrawReason('');
    setShowWithdrawModal(false);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(depositAmount.replace(/\D/g, ''));
    if (isNaN(num) || num <= 0) return;

    onDeposit(num, depositReason.trim() || 'Trích vào quỹ khẩn cấp');
    setDepositAmount(formatNumberWithCommas(emergencyFund.monthlyAllocation.toString()));
    setDepositReason('Trích dự phòng tháng');
    setShowDepositModal(false);
  };

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const alloc = Number(editMonthlyAllocation.replace(/\D/g, ''));
    const target = Number(editTargetAmount.replace(/\D/g, ''));
    if (isNaN(alloc) || isNaN(target) || alloc < 0 || target <= 0) return;

    onUpdateSettings({
      monthlyAllocation: alloc,
      targetAmount: target,
    });
    setShowSettingsModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-600" />
            <span>Quỹ Khẩn Cấp & Đột Xuất</span>
          </h2>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditMonthlyAllocation(formatNumberWithCommas(emergencyFund.monthlyAllocation.toString()));
            setEditTargetAmount(formatNumberWithCommas(emergencyFund.targetAmount.toString()));
            setShowSettingsModal(true);
          }}
          className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 shadow-2xs transition-colors"
          title="Cài đặt hạn mức quỹ"
        >
          <Settings2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Balance Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold block">
              Tiền khẩn cấp đang giữ (tài khoản riêng)
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5 tabular-nums">
              {formatVND(emergencyFund.currentBalance)}
            </div>
            <div className="text-xs text-slate-500 mt-1 tabular-nums">
              Mục tiêu an toàn: <strong className="text-slate-800">{formatVND(emergencyFund.targetAmount)}</strong> ({percent}%)
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold block">
              Kế hoạch trích
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md tabular-nums inline-block mt-1">
              {formatVND(emergencyFund.monthlyAllocation)}/tháng
            </span>
          </div>
        </div>

        {/* Thanh tiến độ tích lũy quỹ khẩn cấp */}
        <div className="space-y-1.5">
          <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 tabular-nums">
            <span>0 ₫</span>
            <span>Mục tiêu ({formatVND(emergencyFund.targetAmount)})</span>
          </div>
        </div>

        {/* Nút hành động Ghi nhận trích / Ghi nhận chi sự cố */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              setDepositAmount(formatNumberWithCommas(emergencyFund.monthlyAllocation.toString()));
              setShowDepositModal(true);
            }}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Trích thêm vào quỹ</span>
          </button>

          <button
            type="button"
            disabled={emergencyFund.currentBalance <= 0}
            onClick={() => setShowWithdrawModal(true)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 disabled:opacity-40 disabled:pointer-events-none text-xs font-bold transition-colors"
          >
            <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
            <span>Ghi nhận sự cố</span>
          </button>
        </div>
      </div>

      {/* Nhật ký thu chi quỹ khẩn cấp */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600 px-0.5">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <History className="w-4 h-4 text-slate-500" />
            <span>Nhật ký biến động quỹ ({emergencyFund.logs?.length || 0})</span>
          </span>
        </div>

        {(!emergencyFund.logs || emergencyFund.logs.length === 0) ? (
          <div className="text-center py-8 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <p className="text-xs font-medium text-slate-500">Chưa có phát sinh nạp hoặc rút quỹ nào</p>
            <p className="text-[11px] text-slate-400 mt-1">Mỗi tháng ứng dụng gợi ý trích 200.000 ₫ từ lương vào đây</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {emergencyFund.logs.map((log) => {
              const isDeposit = log.type === 'deposit';
              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isDeposit ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      {isDeposit ? (
                        <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-800 truncate">
                        {log.reason}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 tabular-nums">
                        <span>{formatDisplayDate(log.date)}</span>
                        <span>•</span>
                        <span>{log.time}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`text-xs font-bold tabular-nums shrink-0 ${isDeposit ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {isDeposit ? '+' : '-'}{formatVND(log.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Ghi nhận chi sự cố khẩn cấp */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleWithdrawSubmit}
            className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>Ghi Nhận Chi Tiêu Sự Cố</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowWithdrawModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-100 text-xs text-rose-800">
              Số dư khẩn cấp hiện có: <strong className="tabular-nums">{formatVND(emergencyFund.currentBalance)}</strong>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Số tiền bạn đã chi (VNĐ):</label>
              <input
                type="text"
                placeholder="VD: 500,000"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(formatNumberWithCommas(e.target.value))}
                autoFocus
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 tabular-nums"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Lý do sự cố:</label>
              <input
                type="text"
                placeholder="VD: Mua thuốc, Khám bệnh, Sửa xe gấp..."
                value={withdrawReason}
                onChange={(e) => setWithdrawReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-rose-500"
              />
            </div>

            <button
              type="submit"
              disabled={!withdrawAmount}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs disabled:opacity-40 transition-colors shadow-xs"
            >
              Lưu vào nhật ký quỹ
            </button>
          </form>
        </div>
      )}

      {/* Modal Ghi nhận Trích thêm vào Quỹ */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleDepositSubmit}
            className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Ghi Nhận Tiền Đã Trích Giữ</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowDepositModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Số tiền bạn để riêng (VNĐ):</label>
              <input
                type="text"
                value={depositAmount}
                onChange={(e) => setDepositAmount(formatNumberWithCommas(e.target.value))}
                autoFocus
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 tabular-nums"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Ghi chú (ngăn thẻ / tài khoản giữ):</label>
              <input
                type="text"
                value={depositReason}
                onChange={(e) => setDepositReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <button
              type="submit"
              disabled={!depositAmount}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs disabled:opacity-40 transition-colors shadow-xs"
            >
              Ghi nhận vào quỹ
            </button>
          </form>
        </div>
      )}

      {/* Modal Cài đặt Hạn mức Quỹ */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSettingsSubmit}
            className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Settings2 className="w-4 h-4" />
                <span>Cài Đặt Quỹ Khẩn Cấp</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Mức trích mặc định mỗi tháng (VNĐ):</label>
              <input
                type="text"
                value={editMonthlyAllocation}
                onChange={(e) => setEditMonthlyAllocation(formatNumberWithCommas(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600 tabular-nums"
              />
              <p className="text-[11px] text-slate-400">Mỗi tháng khi nhận lương, khoản này sẽ được tính vào quỹ dự phòng</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Mục tiêu an toàn tổng quỹ (VNĐ):</label>
              <input
                type="text"
                value={editTargetAmount}
                onChange={(e) => setEditTargetAmount(formatNumberWithCommas(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600 tabular-nums"
              />
              <p className="text-[11px] text-slate-400">Thường bằng 2-3 tháng chi tiêu tối thiểu (khoảng 6-10 triệu)</p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
            >
              Lưu thay đổi
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
