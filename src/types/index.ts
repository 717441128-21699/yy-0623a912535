export type CouponType = 'project_card' | 'activity_coupon' | 'birthday_coupon' | 'treatment_course';
export type VerifyStatus = 'pending_doctor' | 'success' | 'failed' | 'cancelled';
export type FollowUpType = 'no_verify' | 'repurchase' | 'refund_risk' | 'return_visit';
export type VipLevel = '普通' | '银卡' | '金卡' | '钻石';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  age: number;
  avatar: string;
  vipLevel: VipLevel;
  visitCount: number;
  lastVisitDate: string;
  appointmentNo?: string;
}

export interface Coupon {
  id: string;
  customerId: string;
  type: CouponType;
  name: string;
  faceValue: number;
  remainingCount: number;
  totalCount: number;
  expireDate: string;
  applicableItems: string[];
  isRecommended: boolean;
  recommendReason?: string;
}

export interface Doctor {
  id: string;
  name: string;
  department: string;
  title: string;
}

export interface VerifyOrder {
  id: string;
  customerId: string;
  customerName: string;
  couponId: string;
  couponName: string;
  consultantId: string;
  consultantName: string;
  createTime: string;
  treatmentParts: string[];
  dosageRange: string;
  operatingDoctor: string;
  customerSignature: string;
  priceDifference: number;
  originalProject?: string;
  upgradedProject?: string;
  paymentMethod?: string;
  status: VerifyStatus;
  needDoctorConfirm: boolean;
  doctorSignature?: string;
  doctorConfirmTime?: string;
}

export interface FollowUpItem {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar: string;
  type: FollowUpType;
  title: string;
  content: string;
  suggestNextVisit?: string;
  priority: 1 | 2 | 3;
  status: 'pending' | 'processing' | 'done';
  createdAt: string;
  stayDuration?: string;
  consultedProject?: string;
  historicalConsumption?: number;
  refundAmount?: number;
  suggestedItems?: string[];
}

export interface DailyPerformance {
  date: string;
  verifyCount: number;
  consumeAmount: number;
}

export interface ProjectConsumption {
  name: string;
  value: number;
  color: string;
}

export interface Consultant {
  id: string;
  name: string;
  employeeNo: string;
  avatar: string;
}
