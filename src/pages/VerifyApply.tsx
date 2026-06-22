import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Syringe, Stethoscope, Plus, Minus,
  ArrowUpRight, CreditCard, ShieldCheck, CheckCircle2,
  Ticket, AlertCircle, ArrowLeft, Sparkles, Calendar, Clock,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SignaturePad from '../components/SignaturePad';
import { useAppStore } from '../store/appStore';
import { treatmentParts, dosageOptions, paymentMethods } from '../data/mockData';
import type { VerifyOrder } from '@/types';

function needsDoctorConfirm(couponName: string): boolean {
  const keywords = [
    '注射', '玻尿', '肉毒', '水光', '动能素',
    '光子', '光电', '超声', '热玛吉', '热拉提',
    '线雕', '射频', '激光', '点阵',
  ];
  return keywords.some((kw) => couponName.includes(kw));
}

export default function VerifyApply() {
  const { customerId = '' } = useParams();
  const navigate = useNavigate();
  const {
    getCustomerById,
    selectedCouponIds,
    coupons,
    consultant,
    doctors,
    addVerifyOrder,
    decreaseCouponCount,
    addDailyPerformance,
    generateReturnVisit,
    addFollowUpItem,
    clearCouponSelection,
  } = useAppStore();

  const customer = getCustomerById(customerId);
  const selectedCoupons = coupons.filter((c) => selectedCouponIds.includes(c.id));

  const hasAnyCoupon = selectedCoupons.length > 0;
  const autoNeedDoctorConfirm = hasAnyCoupon && selectedCoupons.some((c) => needsDoctorConfirm(c.name));

  const [treatmentPartsSelected, setTreatmentPartsSelected] = useState<string[]>([]);
  const [dosage, setDosage] = useState('标准剂量');
  const [doctorId, setDoctorId] = useState('');
  const [signature, setSignature] = useState('');
  const [needDoctorConfirm, setNeedDoctorConfirm] = useState(autoNeedDoctorConfirm);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [originalProject, setOriginalProject] = useState('');
  const [upgradedProject, setUpgradedProject] = useState('');
  const [priceDifference, setPriceDifference] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [returnVisitId, setReturnVisitId] = useState<string | null>(null);

  useEffect(() => {
    setNeedDoctorConfirm(autoNeedDoctorConfirm);
  }, [autoNeedDoctorConfirm]);

  const togglePart = (part: string) => {
    setTreatmentPartsSelected((prev) =>
      prev.includes(part) ? prev.filter((p) => p !== part) : [...prev, part]
    );
  };

  const handleSubmit = () => {
    if (!hasAnyCoupon) return;

    const selectedDoctor = doctors.find((d) => d.id === doctorId);
    const batchId = `b${Date.now()}`;
    let totalFaceValue = 0;
    let firstReturnVisitId: string | null = null;

    selectedCoupons.forEach((coupon, index) => {
      const isFirstInBatch = index === 0;
      const order: VerifyOrder = {
        id: `v${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
        batchId,
        customerId,
        customerName: customer?.name || '',
        couponId: coupon.id,
        couponName: coupon.name,
        couponFaceValue: coupon.faceValue,
        consultantId: consultant.id,
        consultantName: consultant.name,
        createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        treatmentParts: treatmentPartsSelected,
        dosageRange: dosage,
        operatingDoctor: selectedDoctor?.name || '',
        customerSignature: signature,
        priceDifference: isFirstInBatch ? priceDifference : 0,
        originalProject: isFirstInBatch && showUpgrade ? originalProject : undefined,
        upgradedProject: isFirstInBatch && showUpgrade ? upgradedProject : undefined,
        paymentMethod: isFirstInBatch && showUpgrade ? paymentMethod : undefined,
        status: needDoctorConfirm ? 'pending_doctor' : 'success',
        needDoctorConfirm,
      };
      addVerifyOrder(order);

      if (!needDoctorConfirm) {
        decreaseCouponCount(coupon.id);
        totalFaceValue += coupon.faceValue;

        const returnVisit = generateReturnVisit(coupon.id, customerId);
        if (returnVisit) {
          addFollowUpItem(returnVisit);
          if (!firstReturnVisitId) firstReturnVisitId = returnVisit.id;
        }
      }
    });

    if (!needDoctorConfirm) {
      const totalAmount = totalFaceValue + priceDifference;
      addDailyPerformance(totalAmount, selectedCoupons.length);
    }

    if (firstReturnVisitId) setReturnVisitId(firstReturnVisitId);
    setShowSuccess(true);
  };

  const canSubmit =
    hasAnyCoupon &&
    treatmentPartsSelected.length > 0 &&
    doctorId &&
    signature &&
    (!showUpgrade || (originalProject && upgradedProject && priceDifference > 0 && paymentMethod));

  const handleViewReturnVisit = () => {
    navigate('/follow-up', { state: { highlightId: returnVisitId, highlightType: 'return_visit' } });
  };

  const handleGoSelectCoupon = () => {
    navigate(`/coupons/${customerId}`);
  };

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="核销申请" showBack />
        <div className="p-8 text-center text-gray-500">顾客信息不存在</div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center px-6">
        <div className="animate-[scaleIn_0.5s_ease-out] text-center w-full max-w-sm">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {needDoctorConfirm ? '核销申请已提交' : '核销成功'}
          </h2>
          <p className="text-sm text-gray-500 mb-2">
            {needDoctorConfirm
              ? '已发送至操作医生进行医嘱确认'
              : '卡券已成功核销'}
          </p>

          {selectedCoupons.length > 1 && !needDoctorConfirm && (
            <div className="my-5 p-4 bg-purple-50 rounded-2xl text-left">
              <div className="text-sm font-semibold text-purple-800 mb-2">
                本次核销 {selectedCoupons.length} 张卡券
              </div>
              <div className="space-y-1.5">
                {selectedCoupons.map((c) => (
                  <div key={c.id} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">{c.name}</span>
                    <span className="text-purple-600 font-medium">¥{c.faceValue.toLocaleString()}</span>
                  </div>
                ))}
                {priceDifference > 0 && (
                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-purple-200">
                    <span className="text-gray-600">补差价（整单）</span>
                    <span className="text-purple-600 font-medium">¥{priceDifference.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {!needDoctorConfirm && (
            <div className="my-5 p-4 bg-emerald-50 rounded-2xl text-left">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-800">复诊建议已生成</span>
              </div>
              <p className="text-xs text-emerald-700 leading-relaxed">
                根据您选择的项目类型，已自动生成下次复诊建议，可在「跟进」页面查看详情
              </p>
            </div>
          )}

          {needDoctorConfirm && (
            <div className="my-5 p-4 bg-amber-50 rounded-2xl text-left">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-800">等待医生确认</span>
              </div>
              <p className="text-xs text-amber-700 leading-relaxed">
                医生签字确认后，卡券将正式核销，同时自动生成复诊建议
              </p>
            </div>
          )}

          <div className="space-y-3">
            {!needDoctorConfirm && (
              <button
                onClick={handleViewReturnVisit}
                className="w-full h-12 bg-gradient-to-r from-brand-purple to-brand-pink text-white font-semibold rounded-2xl shadow-lg flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                查看复诊建议
              </button>
            )}
            {needDoctorConfirm && (
              <button
                onClick={() => navigate('/orders')}
                className="w-full h-12 bg-gradient-to-r from-brand-purple to-brand-pink text-white font-semibold rounded-2xl shadow-lg flex items-center justify-center gap-2"
              >
                查看医嘱确认进度
              </button>
            )}
            <button
              onClick={() => {
                clearCouponSelection();
                navigate('/');
              }}
              className="w-full h-12 bg-white text-gray-700 font-semibold rounded-2xl border border-gray-200"
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!hasAnyCoupon) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <PageHeader title="核销申请" showBack />

        <div className="flex flex-col items-center justify-center px-6 pt-20 pb-10">
          <div className="w-20 h-20 mb-5 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            <Ticket className="w-10 h-10 text-brand-purple" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">暂未选择核销卡券</h2>
          <p className="text-sm text-gray-500 text-center mb-8 max-w-xs">
            请先前往卡券推荐页面选择需要核销的卡券，再进行核销操作
          </p>
          <button
            onClick={handleGoSelectCoupon}
            className="w-full max-w-xs h-12 bg-gradient-to-r from-brand-purple to-brand-pink text-white font-semibold rounded-2xl shadow-lg flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            去选择卡券
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-32">
      <PageHeader
        title="核销申请"
        subtitle={`${customer.name} · ${selectedCoupons.length}张券`}
        showBack
      />

      <div className="px-4 pt-4 space-y-4">
        {autoNeedDoctorConfirm && (
          <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl flex items-start gap-2 border border-purple-100">
            <Sparkles className="w-4 h-4 text-brand-purple flex-shrink-0 mt-0.5" />
            <p className="text-xs text-purple-700 leading-relaxed">
              根据您选择的项目类型，系统已自动开启医生医嘱确认
            </p>
          </div>
        )}

        <div className="p-4 bg-white rounded-2xl shadow-card space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Ticket className="w-4 h-4 text-brand-purple" />
            核销卡券
          </div>
          {selectedCoupons.map((coupon) => (
            <div key={coupon.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-1.5 h-12 rounded-full bg-gradient-to-b from-brand-purple to-brand-pink" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{coupon.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  剩余 {coupon.remainingCount} 次 · 有效期至 {coupon.expireDate}
                </div>
                {needsDoctorConfirm(coupon.name) && (
                  <div className="mt-1">
                    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] rounded">
                      需医生确认
                    </span>
                  </div>
                )}
              </div>
              <div className="text-brand-purple font-semibold">
                ¥{coupon.faceValue.toLocaleString()}
              </div>
            </div>
          ))}
          {selectedCoupons.length > 1 && (
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-500">卡券面额合计</span>
              <span className="font-semibold text-gray-900">
                ¥{selectedCoupons.reduce((sum, c) => sum + c.faceValue, 0).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        <div className="p-4 bg-white rounded-2xl shadow-card space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <MapPin className="w-4 h-4 text-brand-purple" />
            治疗部位
          </div>
          <div className="flex flex-wrap gap-2">
            {treatmentParts.map((part) => {
              const isSelected = treatmentPartsSelected.includes(part);
              return (
                <button
                  key={part}
                  onClick={() => togglePart(part)}
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
            剂量区间
          </div>
          <div className="grid grid-cols-3 gap-2">
            {dosageOptions.map((opt) => {
              const isSelected = dosage === opt;
              return (
                <button
                  key={opt}
                  onClick={() => setDosage(opt)}
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

        <div className="p-4 bg-white rounded-2xl shadow-card space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Stethoscope className="w-4 h-4 text-brand-purple" />
            操作医生
          </div>
          <div className="space-y-2">
            {doctors.map((doctor) => {
              const isSelected = doctorId === doctor.id;
              return (
                <button
                  key={doctor.id}
                  onClick={() => setDoctorId(doctor.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-50 to-pink-50 ring-2 ring-brand-purple'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                    isSelected
                      ? 'bg-gradient-to-br from-brand-purple to-brand-pink'
                      : 'bg-gray-300'
                  }`}>
                    {doctor.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{doctor.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {doctor.title} · {doctor.department}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-brand-purple flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl shadow-card space-y-4">
          <SignaturePad value={signature} onChange={setSignature} />
        </div>

        <div className="p-4 bg-white rounded-2xl shadow-card space-y-4">
          {!showUpgrade ? (
            <button
              onClick={() => setShowUpgrade(true)}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-brand-purple hover:text-brand-purple transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">顾客升级项目？记录补差价</span>
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <ArrowUpRight className="w-4 h-4 text-brand-purple" />
                  项目升级补差价
                  {selectedCoupons.length > 1 && (
                    <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">
                      整单
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowUpgrade(false);
                    setOriginalProject('');
                    setUpgradedProject('');
                    setPriceDifference(0);
                    setPaymentMethod('');
                  }}
                  className="text-xs text-gray-400 hover:text-danger"
                >
                  取消
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">原项目</label>
                  <input
                    type="text"
                    value={originalProject}
                    onChange={(e) => setOriginalProject(e.target.value)}
                    placeholder="如：基础水光"
                    className="w-full h-10 px-3 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">升级项目</label>
                  <input
                    type="text"
                    value={upgradedProject}
                    onChange={(e) => setUpgradedProject(e.target.value)}
                    placeholder="如：动能素水光"
                    className="w-full h-10 px-3 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">补差价金额（整单）</label>
                <div className="flex items-center h-10 bg-gray-50 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setPriceDifference(Math.max(0, priceDifference - 100))}
                    className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="flex-1 text-center">
                    <span className="text-lg font-bold text-brand-purple">¥{priceDifference}</span>
                  </div>
                  <button
                    onClick={() => setPriceDifference(priceDifference + 100)}
                    className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block flex items-center gap-1">
                  <CreditCard className="w-3 h-3" />
                  支付方式
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {paymentMethods.map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 rounded-xl text-xs font-medium transition-all ${
                        paymentMethod === method
                          ? 'bg-gradient-to-r from-brand-purple to-brand-pink text-white'
                          : 'bg-gray-50 text-gray-600'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-white rounded-2xl shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                needDoctorConfirm ? 'bg-purple-50' : 'bg-gray-100'
              }`}>
                <ShieldCheck className={`w-5 h-5 ${needDoctorConfirm ? 'text-brand-purple' : 'text-gray-400'}`} />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">需要医生医嘱确认</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {autoNeedDoctorConfirm ? '当前项目建议开启' : '注射、光电类项目建议开启'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setNeedDoctorConfirm(!needDoctorConfirm)}
              className={`w-12 h-7 rounded-full transition-all duration-200 relative ${
                needDoctorConfirm ? 'bg-gradient-to-r from-brand-purple to-brand-pink' : 'bg-gray-200'
              }`}
            >
              <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all duration-200 ${
                needDoctorConfirm ? 'left-5' : 'left-0.5'
              }`} />
            </button>
          </div>
          {needDoctorConfirm && (
            <div className="mt-3 p-3 bg-amber-50 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">
                开启后核销单将发送至操作医生确认，医生签字确认后核销正式生效
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-100 px-4 py-3 pb-5 z-40">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full h-12 font-semibold rounded-2xl transition-all duration-200 ${
            canSubmit
              ? 'bg-gradient-to-r from-brand-purple to-brand-pink text-white shadow-lg hover:shadow-xl active:scale-[0.98]'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {needDoctorConfirm ? '提交医嘱确认' : '确认核销'}
        </button>
      </div>
    </div>
  );
}
