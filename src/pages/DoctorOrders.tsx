import { useState } from 'react';
import {
  Clock, CheckCircle, XCircle, MapPin, Syringe,
  Stethoscope, User, ChevronRight, AlertCircle
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SignaturePad from '../components/SignaturePad';
import TabBar from '../components/TabBar';
import { useAppStore } from '../store/appStore';
import type { VerifyOrder } from '@/types';

type TabKey = 'pending' | 'confirmed' | 'all';

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  pending_doctor: {
    label: '待医生确认',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    icon: Clock,
  },
  success: {
    label: '已确认',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    icon: CheckCircle,
  },
  failed: {
    label: '已驳回',
    color: 'text-red-600',
    bg: 'bg-red-50',
    icon: XCircle,
  },
};

export default function DoctorOrders() {
  const { verifyOrders, updateVerifyOrderStatus } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabKey>('pending');
  const [selectedOrder, setSelectedOrder] = useState<VerifyOrder | null>(null);
  const [doctorSignature, setDoctorSignature] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'pending', label: '待确认' },
    { key: 'confirmed', label: '已确认' },
    { key: 'all', label: '全部' },
  ];

  const filteredOrders = verifyOrders.filter((o) => {
    if (activeTab === 'pending') return o.status === 'pending_doctor';
    if (activeTab === 'confirmed') return o.status !== 'pending_doctor';
    return true;
  });

  const handleConfirm = () => {
    if (selectedOrder && doctorSignature) {
      updateVerifyOrderStatus(selectedOrder.id, 'success', doctorSignature);
      setSelectedOrder(null);
      setDoctorSignature('');
    }
  };

  const handleReject = () => {
    if (selectedOrder && rejectReason.trim()) {
      updateVerifyOrderStatus(selectedOrder.id, 'failed');
      setSelectedOrder(null);
      setRejectReason('');
      setShowRejectInput(false);
    }
  };

  if (selectedOrder) {
    const orderStatus = statusConfig[selectedOrder.status];
    const StatusIcon = orderStatus.icon;

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-32">
        <PageHeader
          title="医嘱确认详情"
          showBack
          rightSlot={
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${orderStatus.bg} ${orderStatus.color}`}>
              {orderStatus.label}
            </span>
          }
        />
        <div
          onClick={() => setSelectedOrder(null)}
          className="px-4 py-3 text-sm text-gray-500 flex items-center gap-1"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          返回列表
        </div>

        <div className="px-4 space-y-4">
          <div className="p-4 bg-white rounded-2xl shadow-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <User className="w-6 h-6 text-brand-purple" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">{selectedOrder.customerName}</div>
                <div className="text-xs text-gray-500 mt-0.5">申请时间：{selectedOrder.createTime}</div>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
              <div className="text-sm font-medium text-gray-900">{selectedOrder.couponName}</div>
              <div className="text-xs text-gray-500 mt-1">咨询师：{selectedOrder.consultantName}</div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl shadow-card space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-brand-purple mt-0.5" />
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">治疗部位</div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedOrder.treatmentParts.map((part) => (
                    <span key={part} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg">
                      {part}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Syringe className="w-4 h-4 text-brand-purple mt-0.5" />
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">剂量区间</div>
                <div className="text-sm font-medium text-gray-900">{selectedOrder.dosageRange}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Stethoscope className="w-4 h-4 text-brand-purple mt-0.5" />
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">操作医生</div>
                <div className="text-sm font-medium text-gray-900">{selectedOrder.operatingDoctor}</div>
              </div>
            </div>
          </div>

          {selectedOrder.priceDifference > 0 && (
            <div className="p-4 bg-white rounded-2xl shadow-card">
              <div className="text-sm font-semibold text-gray-900 mb-3">项目升级补差价</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-gray-500 mb-1">原项目</div>
                  <div className="text-gray-900">{selectedOrder.originalProject}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">升级项目</div>
                  <div className="text-gray-900">{selectedOrder.upgradedProject}</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">补差价金额</span>
                <span className="text-lg font-bold text-brand-purple">¥{selectedOrder.priceDifference.toLocaleString()}</span>
              </div>
            </div>
          )}

          {selectedOrder.status === 'pending_doctor' && (
            <>
              <div className="p-4 bg-white rounded-2xl shadow-card">
                <SignaturePad value={doctorSignature} onChange={setDoctorSignature} label="医生签字确认" />
              </div>

              {showRejectInput ? (
                <div className="p-4 bg-white rounded-2xl shadow-card space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-danger">
                    <AlertCircle className="w-4 h-4" />
                    驳回原因
                  </div>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="请填写驳回原因..."
                    rows={3}
                    className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-danger resize-none"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowRejectInput(false)}
                      className="flex-1 h-11 bg-gray-100 text-gray-600 font-medium rounded-xl"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={!rejectReason.trim()}
                      className={`flex-1 h-11 font-medium rounded-xl ${
                        rejectReason.trim()
                          ? 'bg-danger text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      确认驳回
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>

        {selectedOrder.status === 'pending_doctor' && !showRejectInput && (
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-100 px-4 py-3 pb-5 z-40 flex gap-3">
            <button
              onClick={() => setShowRejectInput(true)}
              className="flex-1 h-12 bg-gray-100 text-gray-700 font-semibold rounded-2xl"
            >
              驳回
            </button>
            <button
              onClick={handleConfirm}
              disabled={!doctorSignature}
              className={`flex-[2] h-12 font-semibold rounded-2xl transition-all ${
                doctorSignature
                  ? 'bg-gradient-to-r from-brand-purple to-brand-pink text-white shadow-lg'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              签字确认
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      <PageHeader title="医嘱确认" subtitle="注射、光电项目需医生签字确认" />

      <div className="px-4 pt-4">
        <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl mb-4">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            const count =
              tab.key === 'pending'
                ? verifyOrders.filter((o) => o.status === 'pending_doctor').length
                : tab.key === 'confirmed'
                ? verifyOrders.filter((o) => o.status !== 'pending_doctor').length
                : verifyOrders.length;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 h-9 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                {tab.label}
                <span className={`ml-1 text-xs ${isActive ? 'text-brand-purple' : 'text-gray-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="py-20 text-center">
            <CheckCircle className="w-14 h-14 mx-auto text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">暂无医嘱确认记录</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order, index) => {
              const cfg = statusConfig[order.status];
              const Icon = cfg.icon;
              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className="animate-[fadeInUp_0.4s_ease-out_both] p-4 bg-white rounded-2xl shadow-card hover:shadow-lg transition-all cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{order.customerName}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{order.createTime}</div>
                    </div>
                    <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                      <Icon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="text-sm font-medium text-gray-900 mb-2">{order.couponName}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {order.treatmentParts.slice(0, 3).map((part) => (
                        <span key={part} className="px-2 py-0.5 bg-white text-gray-600 text-[11px] rounded">
                          {part}
                        </span>
                      ))}
                      {order.treatmentParts.length > 3 && (
                        <span className="px-2 py-0.5 bg-white text-gray-400 text-[11px] rounded">
                          +{order.treatmentParts.length - 3}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                      <span className="text-xs text-gray-500">操作医生：{order.operatingDoctor}</span>
                      <span className="text-xs text-brand-purple font-medium flex items-center gap-0.5">
                        查看详情
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <TabBar />
    </div>
  );
}
