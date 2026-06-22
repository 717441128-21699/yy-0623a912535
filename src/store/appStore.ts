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
  CouponType,
  ModificationRecord,
  TimelineEvent,
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

const returnVisitRules: Record<
  CouponType,
  { days: number; title: string; content: string; suggestedItems: string[] }
> = {
  project_card: {
    days: 30,
    title: '项目治疗复诊提醒',
    content: '治疗后30天建议复诊，评估治疗效果，根据恢复情况调整后续方案',
    suggestedItems: ['效果评估', '后续治疗方案制定'],
  },
  activity_coupon: {
    days: 15,
    title: '活动项目复诊提醒',
    content: '项目治疗后15天复诊，观察术后反应，及时处理任何不适症状',
    suggestedItems: ['术后复查', '修复护理指导'],
  },
  birthday_coupon: {
    days: 21,
    title: '生日专享项目复诊',
    content: '生日专享项目治疗后建议3周复诊，确保效果达到预期',
    suggestedItems: ['效果确认', '生日专属护理'],
  },
  treatment_course: {
    days: 28,
    title: '疗程治疗复诊提醒',
    content: '本次疗程治疗后28天进行下次治疗，请提前预约安排时间',
    suggestedItems: ['下一次疗程治疗', '疗程进度评估'],
  },
};

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function isInRange(dateStr: string, period: 'day' | 'week' | 'month'): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  if (period === 'day') {
    return d.toDateString() === now.toDateString();
  }
  if (period === 'week') {
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= weekAgo && d <= now;
  }
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

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
  updateVerifyOrderStatus: (
    orderId: string,
    status: VerifyOrder['status'],
    options?: { doctorSignature?: string; rejectReason?: string }
  ) => void;
  updateFollowUpStatus: (itemId: string, status: FollowUpItem['status']) => void;
  addFollowUpItem: (item: FollowUpItem) => void;
  decreaseCouponCount: (couponId: string) => void;
  addDailyPerformance: (amount: number, count: number) => void;
  generateReturnVisit: (couponId: string, customerId: string) => FollowUpItem | null;
  getPendingVerifyCount: () => number;
  getPendingFollowUpCount: () => number;
  getMonthlyStats: () => { verifyCount: number; consumeAmount: number; repurchaseRate: number; refundRisk: number };
  resetCouponSelection: () => void;
  resubmitVerifyOrder: (orderId: string, updates: Partial<VerifyOrder>) => void;
  markOrderReturnVisit: (orderId: string) => void;
  getVerifyDetails: (period: 'day' | 'week' | 'month') => VerifyOrder[];
  getActiveRefundRiskAmount: () => number;
  getActiveRefundRiskCount: () => number;
  getActiveFollowUpCount: () => number;
  getActiveNoVerifyCount: () => number;
  updateFollowUpItem: (itemId: string, updates: Partial<FollowUpItem>) => void;
  getCustomerTimeline: (customerId: string) => TimelineEvent[];
  generateReturnVisitFromOrder: (order: VerifyOrder) => FollowUpItem | null;
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

  resetCouponSelection: () => set({ selectedCouponIds: [], selectedCustomerId: null }),

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

  updateVerifyOrderStatus: (orderId, status, options) =>
    set((state) => ({
      verifyOrders: state.verifyOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status,
              doctorSignature: options?.doctorSignature || order.doctorSignature,
              doctorConfirmTime: status === 'success' || status === 'failed'
                ? new Date().toISOString().replace('T', ' ').slice(0, 19)
                : order.doctorConfirmTime,
              rejectReason: status === 'failed'
                ? options?.rejectReason || order.rejectReason
                : status === 'success'
                ? undefined
                : order.rejectReason,
            }
          : order
      ),
    })),

  resubmitVerifyOrder: (orderId, updates) =>
    set((state) => ({
      verifyOrders: state.verifyOrders.map((order) => {
        if (order.id !== orderId) return order;

        const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
        const history: ModificationRecord[] = order.modificationHistory ? [...order.modificationHistory] : [];

        const oldPartsStr = order.treatmentParts.join('、');
        const newPartsStr = updates.treatmentParts?.join('、') || '';
        if (updates.treatmentParts && oldPartsStr !== newPartsStr) {
          history.push({
            time: now,
            field: 'treatmentParts',
            oldValue: oldPartsStr,
            newValue: newPartsStr,
            rejectReason: order.rejectReason || '',
          });
        }
        if (updates.dosageRange && updates.dosageRange !== order.dosageRange) {
          history.push({
            time: now,
            field: 'dosageRange',
            oldValue: order.dosageRange,
            newValue: updates.dosageRange,
            rejectReason: order.rejectReason || '',
          });
        }

        return {
          ...order,
          ...updates,
          status: 'pending_doctor' as const,
          doctorSignature: undefined,
          doctorConfirmTime: undefined,
          modificationHistory: history,
        };
      }),
    })),

  markOrderReturnVisit: (orderId) =>
    set((state) => ({
      verifyOrders: state.verifyOrders.map((order) =>
        order.id === orderId ? { ...order, returnVisitGenerated: true } : order
      ),
    })),

  updateFollowUpStatus: (itemId, status) =>
    set((state) => ({
      followUpItems: state.followUpItems.map((item) =>
        item.id === itemId ? { ...item, status } : item
      ),
    })),

  addFollowUpItem: (item) =>
    set((state) => ({
      followUpItems: [item, ...state.followUpItems],
    })),

  decreaseCouponCount: (couponId) =>
    set((state) => ({
      coupons: state.coupons.map((coupon) =>
        coupon.id === couponId
          ? { ...coupon, remainingCount: Math.max(0, coupon.remainingCount - 1) }
          : coupon
      ),
    })),

  addDailyPerformance: (amount, count) =>
    set((state) => {
      const today = new Date();
      const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;
      const lastItem = state.dailyPerformance[state.dailyPerformance.length - 1];
      if (lastItem && lastItem.date === todayStr) {
        return {
          dailyPerformance: state.dailyPerformance.map((item, index) =>
            index === state.dailyPerformance.length - 1
              ? {
                  ...item,
                  verifyCount: item.verifyCount + count,
                  consumeAmount: item.consumeAmount + amount,
                }
              : item
          ),
        };
      }
      return {
        dailyPerformance: [
          ...state.dailyPerformance,
          { date: todayStr, verifyCount: count, consumeAmount: amount },
        ],
      };
    }),

  generateReturnVisit: (couponId, customerId) => {
    const { coupons, customers } = get();
    const coupon = coupons.find((c) => c.id === couponId);
    const customer = customers.find((c) => c.id === customerId);
    if (!coupon || !customer) return null;

    const rule = returnVisitRules[coupon.type];
    const today = new Date().toISOString().slice(0, 10);

    return {
      id: `f${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
      customerId,
      customerName: customer.name,
      customerAvatar: customer.avatar,
      type: 'return_visit' as const,
      title: rule.title,
      content: rule.content,
      suggestNextVisit: addDays(today, rule.days),
      priority: 3 as const,
      status: 'pending' as const,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      suggestedItems: rule.suggestedItems,
      relatedCouponId: couponId,
    };
  },

  getPendingVerifyCount: () =>
    get().verifyOrders.filter((o) => o.status === 'pending_doctor').length,

  getPendingFollowUpCount: () =>
    get().followUpItems.filter((f) => f.status !== 'done').length,

  getMonthlyStats: () => {
    const { dailyPerformance, followUpItems } = get();
    const verifyCount = dailyPerformance.reduce((sum, d) => sum + d.verifyCount, 0);
    const consumeAmount = dailyPerformance.reduce((sum, d) => sum + d.consumeAmount, 0);
    const refundRisk = followUpItems
      .filter((f) => f.type === 'refund_risk' && f.status !== 'done' && f.refundAmount)
      .reduce((sum, f) => sum + (f.refundAmount || 0), 0);
    const repurchaseRate = 68;

    return { verifyCount, consumeAmount, repurchaseRate, refundRisk };
  },

  getVerifyDetails: (period) => {
    return get().verifyOrders.filter(
      (o) => o.status === 'success' && isInRange(o.createTime, period)
    );
  },

  getActiveRefundRiskAmount: () => {
    return get().followUpItems
      .filter((f) => f.type === 'refund_risk' && f.status !== 'done' && f.refundAmount)
      .reduce((sum, f) => sum + (f.refundAmount || 0), 0);
  },

  getActiveRefundRiskCount: () => {
    return get().followUpItems.filter((f) => f.type === 'refund_risk' && f.status !== 'done').length;
  },

  getActiveFollowUpCount: () => {
    return get().followUpItems.filter((f) => f.status !== 'done').length;
  },

  getActiveNoVerifyCount: () => {
    return get().followUpItems.filter((f) => f.type === 'no_verify' && f.status !== 'done').length;
  },

  updateFollowUpItem: (itemId, updates) =>
    set((state) => ({
      followUpItems: state.followUpItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              ...updates,
              updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
            }
          : item
      ),
    })),

  getCustomerTimeline: (customerId) => {
    const { verifyOrders, followUpItems } = get();
    const events: TimelineEvent[] = [];

    verifyOrders
      .filter((o) => o.customerId === customerId)
      .forEach((order) => {
        events.push({
          id: `t-verify-${order.id}`,
          type: 'verify',
          time: order.createTime,
          title: '卡券核销',
          description: `${order.couponName} · ¥${order.couponFaceValue.toLocaleString()}${
            order.priceDifference > 0 ? `（含补差 ¥${order.priceDifference}）` : ''
          }`,
          relatedId: order.id,
          relatedType: 'verify',
          amount: order.couponFaceValue + order.priceDifference,
        });

        if (order.needDoctorConfirm && order.status === 'success' && order.doctorConfirmTime) {
          events.push({
            id: `t-doctor-${order.id}`,
            type: 'doctor_confirm',
            time: order.doctorConfirmTime,
            title: '医生确认通过',
            description: `操作医生：${order.operatingDoctor || '未填写'}`,
            relatedId: order.id,
            relatedType: 'verify',
          });
        }
        if (order.status === 'failed' && order.rejectReason) {
          events.push({
            id: `t-reject-${order.id}`,
            type: 'doctor_confirm',
            time: order.createTime,
            title: '医生驳回',
            description: `驳回原因：${order.rejectReason}`,
            relatedId: order.id,
            relatedType: 'verify',
          });
        }
      });

    followUpItems
      .filter((f) => f.customerId === customerId)
      .forEach((item) => {
        if (item.type === 'return_visit') {
          events.push({
            id: `t-rv-${item.id}`,
            type: 'return_visit',
            time: item.createdAt,
            title: '复诊建议生成',
            description: `${item.title}${item.suggestNextVisit ? ` · 建议复诊：${item.suggestNextVisit}` : ''}${
              item.remark ? ` · 备注：${item.remark}` : ''
            }`,
            relatedId: item.id,
            relatedType: 'follow_up',
          });
        } else {
          const typeLabel: Record<string, string> = {
            no_verify: '到院未核销跟进',
            repurchase: '复购跟进',
            refund_risk: '退款风险跟进',
          };
          events.push({
            id: `t-fu-${item.id}`,
            type: 'follow_up',
            time: item.createdAt,
            title: typeLabel[item.type] || '跟进',
            description: `${item.content}${
              item.status === 'done' ? '（已完成）' : item.status === 'processing' ? '（跟进中）' : ''
            }`,
            relatedId: item.id,
            relatedType: 'follow_up',
          });
        }
      });

    return events.sort((a, b) => (a.time < b.time ? 1 : -1));
  },

  generateReturnVisitFromOrder: (order) => {
    const { customers, coupons } = get();
    const customer = customers.find((c) => c.id === order.customerId);
    if (!customer) return null;

    const coupon = coupons.find((c) => c.id === order.couponId);
    const couponType: CouponType = coupon?.type || 'project_card';
    const rule = returnVisitRules[couponType] || returnVisitRules.project_card;
    const today = new Date().toISOString().slice(0, 10);

    return {
      id: `f${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
      customerId: order.customerId,
      customerName: order.customerName,
      customerAvatar: customer.avatar,
      type: 'return_visit' as const,
      title: rule.title,
      content: rule.content,
      suggestNextVisit: addDays(today, rule.days),
      priority: 3 as const,
      status: 'pending' as const,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      suggestedItems: rule.suggestedItems,
      relatedCouponId: order.couponId,
      relatedVerifyOrderId: order.id,
    };
  },
}));
