import { AppState, CategoryGroup, RecurringExpense, FinancialGoal } from '../types';

export const DEFAULT_CATEGORIES: CategoryGroup[] = [
  {
    id: 'food',
    name: 'Ăn uống',
    icon: 'Utensils',
    color: '#10b981', // emerald
    isFixed: false,
    monthlyBudget: 1500000,
    subcategories: [
      { id: 'sub_food', name: 'Ăn uống', icon: 'Utensils' },
      { id: 'rice', name: 'Cơm trưa / tối', icon: 'Soup' },
      { id: 'drink', name: 'Nước / Cafe', icon: 'CupSoda' },
    ],
  },
  {
    id: 'supplies',
    name: 'Nhu yếu phẩm',
    icon: 'Package',
    color: '#71717a', // neutral zinc
    isFixed: false,
    monthlyBudget: 800000,
    subcategories: [
      { id: 'sub_supplies', name: 'Nhu yếu phẩm', icon: 'Package' },
      { id: 'household', name: 'Dầu gội / Xà phòng / Đồ sinh hoạt', icon: 'ShowerHead' },
      { id: 'spices', name: 'Gia vị & Đồ bếp', icon: 'Flame' },
    ],
  },
  {
    id: 'decor',
    name: 'Decor',
    icon: 'Paintbrush',
    color: '#8b5cf6', // purple
    isFixed: false,
    monthlyBudget: 500000,
    subcategories: [
      { id: 'sub_decor', name: 'Decor phòng', icon: 'Paintbrush' },
      { id: 'decor_plant', name: 'Cây cảnh / Đèn bàn', icon: 'Flower' },
    ],
  },
  {
    id: 'clothing',
    name: 'Quần áo',
    icon: 'Shirt',
    color: '#ec4899', // pink
    isFixed: false,
    monthlyBudget: 500000,
    subcategories: [
      { id: 'sub_clothing', name: 'Quần áo', icon: 'Shirt' },
      { id: 'shoes', name: 'Giày dép / Phụ kiện', icon: 'Footprints' },
    ],
  },
  {
    id: 'tech',
    name: 'Công nghệ',
    icon: 'Cpu',
    color: '#06b6d4', // cyan
    isFixed: false,
    monthlyBudget: 500000,
    subcategories: [
      { id: 'sub_tech', name: 'Đồ công nghệ', icon: 'Cpu' },
      { id: 'cable', name: 'Cáp sạc / Chuột / Phím', icon: 'Mouse' },
    ],
  },
  {
    id: 'transport',
    name: 'Đi lại',
    icon: 'Bike',
    color: '#eab308', // amber/yellow
    isFixed: false,
    monthlyBudget: 300000,
    subcategories: [
      { id: 'sub_transport', name: 'Đi lại (Xăng/Xe bus/Grab)', icon: 'Bike' },
      { id: 'gas', name: 'Đổ xăng', icon: 'Fuel' },
      { id: 'grab_bus', name: 'Grab / Xe bus / Taxi', icon: 'Car' },
    ],
  },
  {
    id: 'other',
    name: 'Khác',
    icon: 'MoreHorizontal',
    color: '#71717a', // zinc
    isFixed: false,
    monthlyBudget: 300000,
    subcategories: [
      { id: 'sub_other', name: 'Chi phí khác', icon: 'MoreHorizontal' },
      { id: 'emergency', name: 'Phát sinh đột xuất', icon: 'AlertCircle' },
    ],
  },
  {
    id: 'living',
    name: 'Phòng trọ & Tiện ích cố định',
    icon: 'Home',
    color: '#3b82f6', // blue
    isFixed: true,
    subcategories: [
      { id: 'rent', name: 'Tiền nhà/trọ (3 tháng/lần)', icon: 'Key' },
      { id: 'utilities', name: 'Điện & Nước', icon: 'Zap' },
      { id: 'parking', name: 'Gửi xe máy', icon: 'Bike' },
      { id: 'internet', name: 'Mạng Internet', icon: 'Wifi' },
      { id: 'subscription', name: 'YouTube Premium', icon: 'Tv' },
    ],
  },
  {
    id: 'income_group',
    name: 'Thu nhập thêm',
    icon: 'TrendingUp',
    color: '#10b981',
    isFixed: false,
    subcategories: [
      { id: 'extra_income', name: 'Thu nhập thêm / Freelance', icon: 'Plus' },
      { id: 'bonus', name: 'Thưởng / Quà tặng', icon: 'Gift' },
    ],
  },
];

export const INITIAL_RECURRING_EXPENSES: RecurringExpense[] = [
  {
    id: 'rec_rent',
    name: 'Tiền trọ (3 tháng đóng 1 lần)',
    subCategoryId: 'rent',
    amount: 3900000,
    cycle: 'quarterly',
    dueOption: 'end_of_month',
    anchorMonth: '2026-10',
    notes: 'Đóng vào cuối tháng 10, cứ 3 tháng đóng 1 lần (10/2026 -> 01/2027 -> 04/2027...)',
  },
  {
    id: 'rec_utilities',
    name: 'Điện nước sinh hoạt',
    subCategoryId: 'utilities',
    amount: 600000,
    cycle: 'monthly',
    dueOption: 'start_of_month',
    notes: 'Ước lượng ~600k (có thể sửa số thực tế mỗi tháng)',
  },
  {
    id: 'rec_parking',
    name: 'Tiền gửi xe',
    subCategoryId: 'parking',
    amount: 200000,
    cycle: 'monthly',
    dueOption: 'start_of_month',
  },
  {
    id: 'rec_internet',
    name: 'Tiền mạng cáp quang',
    subCategoryId: 'internet',
    amount: 80000,
    cycle: 'monthly',
    dueOption: 'start_of_month',
  },
  {
    id: 'rec_youtube',
    name: 'YouTube Premium gia đình/chia gói',
    subCategoryId: 'subscription',
    amount: 60000,
    cycle: 'monthly',
    dueOption: 'end_of_month',
  },
];

export const INITIAL_GOALS: FinancialGoal[] = [
  {
    id: 'goal_pc',
    name: 'Mua Máy Tính Mới 💻',
    icon: 'Laptop',
    targetAmount: 20000000, // 20tr dự kiến
    currentAmount: 0,
    priority: 1, // Ưu tiên số 1: dồn tiền trước
    notes: 'Phục vụ học tập, nâng cao tay nghề và làm việc hiệu quả',
  },
  {
    id: 'goal_car',
    name: 'Học Bằng Lái Xe Ô Tô 🚗',
    icon: 'Car',
    targetAmount: 18000000, // 18tr dự kiến
    currentAmount: 0,
    priority: 2, // Ưu tiên số 2
    notes: 'Khóa học thực hành và thi lấy bằng B2',
  },
  {
    id: 'goal_master',
    name: 'Quỹ Học Thạc Sĩ 🎓',
    icon: 'GraduationCap',
    targetAmount: 50000000, // 50tr
    currentAmount: 0,
    priority: 3, // Ưu tiên số 3
    notes: 'Học phí chương trình cao học trong tương lai',
  },
];

export const DEFAULT_EMERGENCY_FUND = {
  monthlyAllocation: 200000, // 200.000đ mỗi tháng
  currentBalance: 0,
  targetAmount: 10000000, // 10tr mục tiêu an toàn
  logs: [],
};

export const DEFAULT_INITIAL_STATE: AppState = {
  profile: {
    isOnboarded: false,
    monthlySalary: 8000000,
    payday: 5,
    theme: 'dark',
  },
  categories: DEFAULT_CATEGORIES,
  recurringExpenses: INITIAL_RECURRING_EXPENSES,
  transactions: [],
  goals: INITIAL_GOALS,
  emergencyFund: DEFAULT_EMERGENCY_FUND,
};
