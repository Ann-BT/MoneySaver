export type ExpenseCycle = 'monthly' | 'quarterly' | 'yearly';
export type DueOption = 'start_of_month' | 'end_of_month';
export type TransactionType = 'expense' | 'income';

export interface SubCategory {
  id: string;
  name: string;
  icon?: string;
  monthlyLimit?: number; // Hạn mức riêng cho con (VD: Cà phê max 300k/tháng)
}

export interface CategoryGroup {
  id: string;
  name: string;
  icon: string;
  color: string;
  isFixed: boolean; // Khoản chi cố định hay phát sinh linh hoạt
  monthlyBudget?: number; // Ngân sách tổng cho nhóm (VD: Ăn uống max 1.5tr)
  subcategories: SubCategory[];
}

export interface RecurringExpense {
  id: string;
  name: string;
  subCategoryId: string;
  amount: number; // Giá trị định kỳ mặc định
  cycle: ExpenseCycle; // 'monthly' | 'quarterly' (3 tháng) | 'yearly'
  dueOption: DueOption; // 'start_of_month' (Đầu tháng) hoặc 'end_of_month' (Cuối tháng)
  anchorMonth?: string; // Tháng mốc bắt đầu đóng (VD: '2026-10' cho tiền nhà cuối tháng 10)
  notes?: string;
  // Cho phép ghi đè giá theo từng tháng mà không làm hỏng giá gốc
  monthlyOverrides?: Record<string, number>; // { '2026-10': 550000 }
  // Danh sách các tháng đã tick "Đã đóng": { '2026-10': true }
  paidMonths?: Record<string, boolean>;
}

export interface Transaction {
  id: string;
  type?: TransactionType; // 'expense' (mặc định) | 'income' (thu nhập thêm)
  amount: number;
  groupId: string;
  subCategoryId: string;
  subCategoryName: string;
  date: string; // ISO date YYYY-MM-DD
  time: string; // HH:mm
  notes?: string;
  isRecurringInstance?: boolean;
}

export interface FinancialGoal {
  id: string;
  name: string;
  icon: string;
  targetAmount: number;
  currentAmount: number;
  priority: number; // 1: Cao nhất (được dồn tiền trước)
  targetDate?: string;
  notes?: string;
}

export interface EmergencyFundLog {
  id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  reason: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
}

export interface EmergencyFund {
  monthlyAllocation: number; // Mức trích mỗi tháng (mặc định 200.000đ)
  currentBalance: number; // Tổng số dư hiện có trong quỹ khẩn cấp
  targetAmount: number; // Mục tiêu an toàn (VD: 10.000.000đ - 3 tháng sinh hoạt cơ bản)
  logs: EmergencyFundLog[]; // Lịch sử trích vào / rút ra khi có sự cố
}

export interface UserProfile {
  isOnboarded: boolean;
  monthlySalary: number; // Lương cố định hàng tháng (8.000.000 ₫)
  payday: number; // Ngày nhận lương hàng tháng
  theme: 'dark' | 'light';
}

export interface AppState {
  profile: UserProfile;
  categories: CategoryGroup[];
  recurringExpenses: RecurringExpense[];
  transactions: Transaction[];
  goals: FinancialGoal[];
  emergencyFund?: EmergencyFund;
}
