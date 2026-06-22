import { create } from 'zustand';
import type {
  Customer,
  Coupon,
  VerifyOrder,
  FollowUpItem,
  DailyPerformance,
  ProjectConsumption,
  Consultant,
  Doctor,
} from '@/types';
import {
  mockCustomers,
  mockCoupons,
  mockVerifyOrders,
  mockFollowUpItems,
  mockDailyPerformance,
  mockProjectConsumption,
  mockConsultant,
  mockDoctors,
} from '../data/mockData';

interface AppState {
  consultant: Consultant;
  customers: Customer[];
  coupons: Coupon[];
  verifyOrders: VerifyOrder[];
  followUpItems: FollowUpItem[];
  dailyPerformance: DailyPerformance[];
  projectConsumption: ProjectConsumption[];
  doctors: Doctor[];
  searchKeyword: string;
  selectedCustomerId: string | null;
  selectedCouponIds: string[];

  setSearchKeyword: (keyword: string) => void;
  setSelectedCustomerId: (id: string | null) => void;
  toggleCouponSelection: (couponId: string) => void;
  clearCouponSelection: () => void;
  getCustomerById: (id: string) => Customer | undefined;
  getCouponsByCustomerId: (customerId: string) => Coupon[];
  getFilteredCustomers: () => Customer[];
  addVerifyOrder: (order: VerifyOrder) => void;
  updateVerifyOrderStatus: (orderId: string, status: VerifyOrder['status'], doctorSignature?: string) => void;
  updateFollowUpStatus: (itemId: string, status: FollowUpItem['status']) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  consultant: mockConsultant,
  customers: mockCustomers,
  coupons: mockCoupons,
  verifyOrders: mockVerifyOrders,
  followUpItems: mockFollowUpItems,
  dailyPerformance: mockDailyPerformance,
  projectConsumption: mockProjectConsumption,
  doctors: mockDoctors,
  searchKeyword: '',
  selectedCustomerId: null,
  selectedCouponIds: [],

  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),

  setSelectedCustomerId: (id) => set({ selectedCustomerId: id, selectedCouponIds: [] }),

  toggleCouponSelection: (couponId) =>
    set((state) => ({
      selectedCouponIds: state.selectedCouponIds.includes(couponId)
        ? state.selectedCouponIds.filter((id) => id !== couponId)
        : [...state.selectedCouponIds, couponId],
    })),

  clearCouponSelection: () => set({ selectedCouponIds: [] }),

  getCustomerById: (id) => get().customers.find((c) => c.id === id),

  getCouponsByCustomerId: (customerId) =>
    get().coupons.filter((c) => c.customerId === customerId),

  getFilteredCustomers: () => {
    const { customers, searchKeyword } = get();
    if (!searchKeyword.trim()) return customers.filter((c) => c.appointmentNo);
    const keyword = searchKeyword.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(keyword) ||
        c.phone.includes(keyword) ||
        (c.appointmentNo && c.appointmentNo.toLowerCase().includes(keyword))
    );
  },

  addVerifyOrder: (order) =>
    set((state) => ({
      verifyOrders: [order, ...state.verifyOrders],
    })),

  updateVerifyOrderStatus: (orderId, status, doctorSignature) =>
    set((state) => ({
      verifyOrders: state.verifyOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status,
              doctorSignature: doctorSignature || order.doctorSignature,
              doctorConfirmTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
            }
          : order
      ),
    })),

  updateFollowUpStatus: (itemId, status) =>
    set((state) => ({
      followUpItems: state.followUpItems.map((item) =>
        item.id === itemId ? { ...item, status } : item
      ),
    })),
}));
