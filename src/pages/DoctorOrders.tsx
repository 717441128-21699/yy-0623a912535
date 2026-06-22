import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock, CheckCircle, XCircle, MapPin, Syringe,
  Stethoscope, User, ChevronRight, AlertCircle,
  RotateCcw, FileText, Calendar, Sparkles, History,
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
  const navigate = useNavigate();
  const {
    verifyOrders,
    updateVerifyOrderStatus,
    decreaseCouponCount,
    addDailyPerformance,
    generateReturnVisitFromOrder,
    addFollowUpItem,
    resubmitVerifyOrder,
    markOrderReturnVisit,
    coupons,
    customers,
  } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabKey>('pending');
  const [selectedOrder, setSelectedOrder] = useState<VerifyOrder | null>(null);
  const [doctorSignature, setDoctorSignature] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [resubmitMode, setResubmitMode] = useState(false);
  const [editParts, setEditParts] = useState<string[]>([]);
  const [editDosage, setEditDosage] = useState('');
  const [confirmSuccessId, setConfirmSuccessId] = useState<string | null>(null);
  const [confirmReturnVisitId, setConfirmReturnVisitId] = useState<string | null>(null);

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'pending', label: '待确认' },
    { key: 'confirmed', label: '已处理' },
    { key: 'all', label: '全部' },
  ];

  const filteredOrders = verifyOrders.filter((o) => {
    if (activeTab === 'pending') return o.status === 'pending_doctor';
    if (activeTab === 'confirmed') return o.status !== 'pending_doctor';
    return true;
  });

  const handleConfirm = () => {
    if (!selectedOrder || !doctorSignature) return;

    updateVerifyOrderStatus(selectedOrder.id, 'success', {
      doctorSignature,
    });

    decreaseCouponCount(selectedOrder.couponId);

    const totalAmount = selectedOrder.couponFaceValue + selectedOrder.priceDifference;
    addDailyPerformance(totalAmount, 1);

    const returnVisit = generateReturnVisitFromOrder(selectedOrder);
    if (returnVisit) {
      addFollowUpItem(returnVisit);
      setConfirmReturnVisitId(returnVisit.id);
    }

    markOrderReturnVisit(selectedOrder.id);
    setConfirmSuccessId(selectedOrder.id);
    setDoctorSignature('');
  };

  const handleReject = () => {
    if (!selectedOrder || !rejectReason.trim()) return;
    updateVerifyOrderStatus(selectedOrder.id, 'failed', {
      rejectReason,
    });
    setSelectedOrder(null);
    setRejectReason('');
    setShowRejectInput(false);
    setActiveTab('confirmed');
  };

  const handleResubmit = (order: VerifyOrder) => {
    setSelectedOrder(order);
    setResubmitMode(true);
    setEditParts([...order.treatmentParts]);
    setEditDosage(order.dosageRange);
  };

  const handleSubmitResubmit = () => {
    if (!selectedOrder) return;
    resubmitVerifyOrder(selectedOrder.id, {
      treatmentParts: editParts,
      dosageRange: editDosage,
    });
    setSelectedOrder(null);
    setResubmitMode(false);
    setActiveTab('pending');
  };

  const handleViewReturnVisit = () => {
    navigate('/follow-up', { state: { highlightId: confirmReturnVisitId, highlightType: 'return_visit' } });
  };

  const toggleEditPart = (part: string) => {
    setEditParts((prev) =>
      prev.includes(part) ? prev.filter((p) => p !== part) : [...prev, part]
    );
  };

  const treatmentPartsList = [
    '额头', '眉骨', '眼周', '泪沟', '苹果肌',
    '鼻唇沟', '脸颊', '下颌线', '下巴', '颈部',
    '全面部', 'T区', '鼻翼', '口周',
  ];
  const dosageOptions = [
    '标准剂量', '0.5ml以下', '0.5-1.0ml', '1.0-1.5ml', '1.5-2.0ml', '2.0ml以上',
  ];

  if (confirmSuccessId && selectedOrder) {
    const order = verifyOrders.find((o) => o.id === confirmSuccessId);
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center px-6">
        <div className="animate-[scaleIn_0.5s_ease-out] text-center w-full max-w-sm">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
            <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">医嘱确认成功</h2>
          <p className="text-sm text-gray-500 mb-1">
            顾客 {order?.customerName} 的核销单已确认通过
          </p>
          <p className="text-sm text-gray-500 mb-4">
            卡券已正式核销，业绩数据已同步更新
          </p>

          <div className="my-5 p-4 bg-emerald-50 rounded-2xl text-left">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-800">复诊建议已生成</span>
            </div>
            <p className="text-xs text-emerald-700 leading-relaxed">
              根据核销项目类型，已自动生成复诊建议，可前往跟进页面查看
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleViewReturnVisit}
              className="w-full h-12 bg-gradient-to-r from-brand-purple to-brand-pink text-white font-semibold rounded-2xl shadow-lg flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              查看复诊建议
            </button>
            <button
              onClick={() => {
                setConfirmSuccessId(null);
                setConfirmReturnVisitId(null);
                setSelectedOrder(null);
                setActiveTab('confirmed');
              }}
              className="w-full h-12 bg-white text-gray-700 font-semibold rounded-2xl border border-gray-200"
            >
              继续确认其他
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedOrder && resubmitMode) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-32">
        <PageHeader
          title="重新提交核销"
          showBack
          rightSlot={
            <button
              onClick={() => {
                setSelectedOrder(null);
                setResubmitMode(false);
              }}
              className="text-xs text-gray-500"
            >
              取消
            </button>
          }
        />

        <div className="px-4 pt-4 space-y-4">
          <div className="p-4 bg-white rounded-2xl shadow-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <User className="w-6 h-6 text-brand-purple" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">{selectedOrder.customerName}</div>
                <div className="text-xs text-gray-500 mt-0.5">{selectedOrder.couponName}</div>
              </div>
            </div>
            <div className="p-3 bg-red-50 rounded-xl border border-red-100">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-red-700 mb-1">驳回原因</div>
                  <p className="text-xs text-red-600">{selectedOrder.rejectReason}</p>
                </div>
              </div>
            </div>
          </div>

          {selectedOrder.modificationHistory && selectedOrder.modificationHistory.length > 0 && (
            <div className="p-4 bg-white rounded-2xl shadow-card">
              <div className="flex items-center gap-2 mb-3">
                <History className="w-4 h-4 text-brand-purple" />
                <span className="text-sm font-semibold text-gray-900">修改记录</span>
              </div>
              <div className="space-y-3">
                {selectedOrder.modificationHistory.map((record, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span>{record.field === 'treatmentParts' ? '治疗部位' : '剂量区间'}</span>
                      <span>{record.time.slice(5, 16)}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-red-500 line-through">{record.oldValue}</span>
                      <span className="mx-1.5 text-gray-300">→</span>
                      <span className="text-emerald-600">{record.newValue}</span>
                    </div>
                    {record.rejectReason && (
                      <div className="text-[10px] text-gray-500 mt-1">
                        驳回原因：{record.rejectReason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 bg-white rounded-2xl shadow-card space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <MapPin className="w-4 h-4 text-brand-purple" />
              治疗部位（修改）
            </div>
            <div className="flex flex-wrap gap-2">
              {treatmentPartsList.map((part) => {
                const isSelected = editParts.includes(part);
                return (
                  <button
                    key={part}
                    onClick={() => toggleEditPart(part)}
                    className={`px-3.5 py-2 rounded-xl text-sm transition-all duration-200 ${
                      isSelected
                        ? 'bg-gradient-to-r from-brand-purple to-brand-pink text-white shadow-md'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {part}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl shadow-card space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Syringe className="w-4 h-4 text-brand-purple" />
              剂量区间（修改）
            </div>
            <div className="grid grid-cols-3 gap-2">
              {dosageOptions.map((opt) => {
                const isSelected = editDosage === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => setEditDosage(opt)}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isSelected
                        ? 'bg-gradient-to-r from-brand-purple to-brand-pink text-white shadow-md'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-100 px-4 py-3 pb-5 z-40">
          <button
            onClick={handleSubmitResubmit}
            disabled={editParts.length === 0 || !editDosage}
            className={`w-full h-12 font-semibold rounded-2xl transition-all ${
              editParts.length > 0 && editDosage
                ? 'bg-gradient-to-r from-brand-purple to-brand-pink text-white shadow-lg'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            重新提交
          </button>
        </div>
      </div>
    );
  }

  if (selectedOrder) {
    const orderStatus = statusConfig[selectedOrder.status];
    const StatusIcon = orderStatus.icon;
    const customer = customers.find((c) => c.id === selectedOrder.customerId);

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
        <button
          onClick={() => setSelectedOrder(null)}
          className="px-4 py-3 text-sm text-gray-500 flex items-center gap-1"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          返回列表
        </button>

        <div className="px-4 space-y-4">
          <div className="p-4 bg-white rounded-2xl shadow-card">
            <div className="flex items-center gap-3 mb-4">
              {customer?.avatar ? (
                <img
                  src={customer.avatar}
                  alt={selectedOrder.customerName}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-pink-100"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-brand-purple" />
                </div>
              )}
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{selectedOrder.customerName}</div>
                <div className="text-xs text-gray-500 mt-0.5">申请时间：{selectedOrder.createTime}</div>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
              <div className="text-sm font-medium text-gray-900">{selectedOrder.couponName}</div>
              <div className="text-xs text-gray-500 mt-1">咨询师：{selectedOrder.consultantName}</div>
            </div>
          </div>

          {selectedOrder.rejectReason && (
            <div className="p-4 bg-white rounded-2xl shadow-card border-l-4 border-red-400">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm font-semibold text-red-700">驳回原因</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{selectedOrder.rejectReason}</p>
            </div>
          )}

          {selectedOrder.modificationHistory && selectedOrder.modificationHistory.length > 0 && (
            <div className="p-4 bg-white rounded-2xl shadow-card">
              <div className="flex items-center gap-2 mb-3">
                <History className="w-4 h-4 text-brand-purple" />
                <span className="text-sm font-semibold text-gray-900">修改记录</span>
              </div>
              <div className="space-y-3">
                {selectedOrder.modificationHistory.map((record, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span>{record.field === 'treatmentParts' ? '治疗部位' : '剂量区间'}</span>
                      <span>{record.time.slice(5, 16)}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-red-500 line-through">{record.oldValue}</span>
                      <span className="mx-1.5 text-gray-300">→</span>
                      <span className="text-emerald-600">{record.newValue}</span>
                    </div>
                    {record.rejectReason && (
                      <div className="text-[10px] text-gray-500 mt-1">
                        原因：{record.rejectReason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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

          <div className="p-4 bg-white rounded-2xl shadow-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">卡券面额</span>
              <span className="text-sm font-semibold text-brand-purple">
                ¥{selectedOrder.couponFaceValue.toLocaleString()}
              </span>
            </div>
            {selectedOrder.priceDifference > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500">补差价</span>
                <span className="text-sm font-semibold text-amber-600">
                  ¥{selectedOrder.priceDifference.toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500">核销金额</span>
              <span className="text-sm font-bold text-gray-900">
                ¥{(selectedOrder.couponFaceValue + selectedOrder.priceDifference).toLocaleString()}
              </span>
            </div>
            {selectedOrder.needDoctorConfirm && (
              <div className="mt-2 flex items-center gap-1 text-[10px] text-purple-500">
                <FileText className="w-3 h-3" />
                医生确认来源
              </div>
            )}
            {selectedOrder.returnVisitGenerated && (
              <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-500">
                <Calendar className="w-3 h-3" />
                复诊建议已生成
              </div>
            )}
          </div>

          {selectedOrder.priceDifference > 0 && (
            <div className="p-4 bg-white rounded-2xl shadow-card">
              <div className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-purple" />
                项目升级补差价
              </div>
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
                <span className="text-lg font-bold text-brand-purple">
                  ¥{selectedOrder.priceDifference.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {selectedOrder.status === 'success' && selectedOrder.doctorSignature && (
            <div className="p-4 bg-white rounded-2xl shadow-card">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-semibold text-gray-900">医生确认签字</span>
              </div>
              <div className="h-20 bg-gray-50 rounded-xl flex items-center justify-center">
                <span className="text-xs text-gray-400">医生签字已确认 · {selectedOrder.doctorConfirmTime}</span>
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

          {selectedOrder.status === 'failed' && (
            <button
              onClick={() => handleResubmit(selectedOrder)}
              className="w-full h-12 bg-gradient-to-r from-brand-purple to-brand-pink text-white font-semibold rounded-2xl shadow-lg flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              修改后重新提交
            </button>
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
                  className="animate-[fadeInUp_0.4s_ease-out_both] p-4 bg-white rounded-2xl shadow-card hover:shadow-lg transition-all cursor-pointer active:scale-[0.99] relative overflow-hidden"
                >
                  {order.status === 'failed' && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-red-400" />
                  )}

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
                    <div className="text-sm font-medium text-gray-900 mb-2 truncate">{order.couponName}</div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
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
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <span className="text-xs text-gray-500">操作医生：{order.operatingDoctor}</span>
                      <span className="text-xs text-brand-purple font-medium flex items-center gap-0.5">
                        查看详情
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>

                  {order.rejectReason && (
                    <div className="mt-3 p-2.5 bg-red-50 rounded-xl flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-600 line-clamp-2">{order.rejectReason}</p>
                    </div>
                  )}

                  {order.modificationHistory && order.modificationHistory.length > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-purple-500">
                      <History className="w-3 h-3" />
                      已修改 {order.modificationHistory.length} 次
                    </div>
                  )}
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
