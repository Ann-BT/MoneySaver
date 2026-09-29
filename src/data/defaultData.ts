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
      { id: 'rent', name: 'Tiền nhà/trọ', icon: 'Key' },
      { id: 'utilities', name: 'Điện & Nước', icon: 'Zap' },
      { id: 'parking', name: 'Gửi xe', icon: 'Bike' },
      { id: 'internet', name: 'Mạng Internet', icon: 'Wifi' },
      { id: 'subscription', name: 'Đăng ký định kỳ', icon: 'Tv' },
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

export const INITIAL_RECURRING_EXPENSES: RecurringExpense[] = [];

export const INITIAL_GOALS: FinancialGoal[] = [];

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
    theme: 'light',
  },
  categories: DEFAULT_CATEGORIES,
  recurringExpenses: [],
  transactions: [],
  goals: [],
  emergencyFund: DEFAULT_EMERGENCY_FUND,
};
