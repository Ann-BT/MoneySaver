import React, { useState } from 'react';
import { EmergencyFund } from '../types';
import { formatVND, formatDisplayDate } from '../utils/formatters';
import { ShieldAlert, Plus, ArrowDownRight, ArrowUpRight, History, Settings2, AlertCircle } from 'lucide-react';

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
  const [depositAmount, setDepositAmount] = useState<string>(emergencyFund.monthlyAllocation.toString());
  const [depositReason, setDepositReason] = useState<string>('Trích dự phòng tháng');

  const [editMonthlyAllocation, setEditMonthlyAllocation] = useState<string>(emergencyFund.monthlyAllocation.toString());
  const [editTargetAmount, setEditTargetAmount] = useState<string>(emergencyFund.targetAmount.toString());

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
    setDepositAmount(emergencyFund.monthlyAllocation.toString());
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
    <div className="space-y-4 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Quỹ Khẩn Cấp & Đột Xuất</span>
          </h2>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Dành riêng cho ốm đau, viện phí, tai nạn, sự cố bất khả kháng
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditMonthlyAllocation(emergencyFund.monthlyAllocation.toString());
            setEditTargetAmount(emergencyFund.targetAmount.toString());
            setShowSettingsModal(true);
          }}
          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
          title="Cài đặt hạn mức quỹ"
        >
          <Settings2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Balance Card */}
      <div className="p-4 rounded-xl bg-black border border-zinc-900 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-zinc-500 block">Tiền khẩn cấp đang giữ (trong thẻ/bank)</span>
            <div className="text-2xl font-bold text-white tracking-tight mt-0.5">
              {formatVND(emergencyFund.currentBalance)}
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">
              Mục tiêu an toàn: <span className="text-zinc-200">{formatVND(emergencyFund.targetAmount)}</span> ({percent}%)
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] uppercase tracking-wider text-zinc-500 block">Kế hoạch trích giữ</span>
            <span className="text-xs font-semibold text-rose-400">
              {formatVND(emergencyFund.monthlyAllocation)}/tháng
            </span>
          </div>
        </div>

        {/* Thanh tiến độ tích lũy quỹ khẩn cấp */}
        <div className="space-y-1">
          <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
            <div
              className="h-full bg-rose-500 rounded-full transition-all duration-300"
              style={{ width: `${percent}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] text-zinc-500">
            <span>0đ</span>
            <span>Mục tiêu an toàn ({formatVND(emergencyFund.targetAmount)})</span>
          </div>
        </div>

        {/* Nút hành động Ghi nhận trích / Ghi nhận chi sự cố */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-900">
          <button
            type="button"
            onClick={() => {
              setDepositAmount(emergencyFund.monthlyAllocation.toString());
              setShowDepositModal(true);
            }}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ghi nhận trích thêm</span>
          </button>

          <button
            type="button"
            disabled={emergencyFund.currentBalance <= 0}
            onClick={() => setShowWithdrawModal(true)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 border border-rose-900/40 disabled:opacity-30 disabled:pointer-events-none text-xs font-medium transition-colors"
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Ghi nhận chi sự cố</span>
          </button>
        </div>
      </div>

      {/* Nhật ký thu chi quỹ khẩn cấp */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-400 px-0.5">
          <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-zinc-500" />
            <span>Nhật ký biến động quỹ ({emergencyFund.logs?.length || 0})</span>
          </span>
        </div>

        {(!emergencyFund.logs || emergencyFund.logs.length === 0) ? (
          <div className="text-center py-8 rounded-xl bg-zinc-950 border border-zinc-900">
            <p className="text-xs text-zinc-500">Chưa có phát sinh rút tiền hoặc nạp quỹ nào</p>
            <p className="text-[10px] text-zinc-600 mt-1">Mỗi tháng hệ thống sẽ hỗ trợ bạn trích 200.000đ từ lương vào đây</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {emergencyFund.logs.map((log) => {
              const isDeposit = log.type === 'deposit';
              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950 border border-zinc-900"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-7 h-7 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                      {isDeposit ? (
                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-zinc-200 truncate">
                        {log.reason}
                      </div>
                      <div className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                        <span>{formatDisplayDate(log.date)}</span>
                        <span>•</span>
                        <span>{log.time}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`text-xs font-semibold shrink-0 ${isDeposit ? 'text-emerald-400' : 'text-rose-400'}`}>
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleWithdrawSubmit}
            className="w-full max-w-sm bg-black border border-zinc-800 rounded-xl p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>Ghi Nhận Chi Tiêu Sự Cố</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowWithdrawModal(false)}
                className="text-xs text-zinc-500 hover:text-zinc-300"
              >
                Đóng
              </button>
            </div>

            <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-900 text-xs text-zinc-400">
              Số dư khẩn cấp đang ghi nhận: <span className="text-white font-bold">{formatVND(emergencyFund.currentBalance)}</span>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Số tiền bạn đã chuyển khoản/chi (VNĐ):</label>
              <input
                type="text"
                placeholder="VD: 500000"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                autoFocus
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Lý do sự cố:</label>
              <input
                type="text"
                placeholder="VD: Mua thuốc, Khám bệnh, Sửa xe gấp..."
                value={withdrawReason}
                onChange={(e) => setWithdrawReason(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-rose-500"
              />
            </div>

            <button
              type="submit"
              disabled={!withdrawAmount}
              className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg text-xs disabled:opacity-30 transition-colors"
            >
              Lưu vào nhật ký quỹ
            </button>
          </form>
        </div>
      )}

      {/* Modal Ghi nhận Trích thêm vào Quỹ */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleDepositSubmit}
            className="w-full max-w-sm bg-black border border-zinc-800 rounded-xl p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                <span>Ghi Nhận Tiền Đã Trích Giữ</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowDepositModal(false)}
                className="text-xs text-zinc-500 hover:text-zinc-300"
              >
                Đóng
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Số tiền bạn để riêng trong bank/ví (VNĐ):</label>
              <input
                type="text"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                autoFocus
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Ghi chú (ngăn thẻ / tài khoản giữ):</label>
              <input
                type="text"
                value={depositReason}
                onChange={(e) => setDepositReason(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={!depositAmount}
              className="w-full py-2 bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg text-xs disabled:opacity-30 transition-colors"
            >
              Ghi nhận vào quỹ
            </button>
          </form>
        </div>
      )}

      {/* Modal Cài đặt Hạn mức Quỹ */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSettingsSubmit}
            className="w-full max-w-sm bg-black border border-zinc-800 rounded-xl p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Settings2 className="w-4 h-4" />
                <span>Cài Đặt Quỹ Khẩn Cấp</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="text-xs text-zinc-500 hover:text-zinc-300"
              >
                Đóng
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Mức trích mặc định mỗi tháng (VNĐ):</label>
              <input
                type="text"
                value={editMonthlyAllocation}
                onChange={(e) => setEditMonthlyAllocation(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-500"
              />
              <p className="text-[10px] text-zinc-500">Mỗi tháng khi nhận lương, khoản này sẽ được tính vào quỹ dự phòng</p>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Mục tiêu an toàn tổng quỹ (VNĐ):</label>
              <input
                type="text"
                value={editTargetAmount}
                onChange={(e) => setEditTargetAmount(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-500"
              />
              <p className="text-[10px] text-zinc-500">Thường bằng 2-3 tháng chi tiêu tối thiểu (khoảng 6-10 triệu)</p>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg text-xs transition-colors"
            >
              Lưu thay đổi
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
