import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layers, Ticket, Gift, Clock, Sparkles, ChevronRight } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import CouponCard from '../components/CouponCard';
import { useAppStore } from '../store/appStore';
import type { CouponType } from '@/types';

const tabs: { key: 'all' | CouponType; label: string; icon: typeof Layers }[] = [
  { key: 'all', label: '全部', icon: Layers },
  { key: 'project_card', label: '项目卡', icon: Layers },
  { key: 'activity_coupon', label: '活动券', icon: Ticket },
  { key: 'birthday_coupon', label: '生日券', icon: Gift },
  { key: 'treatment_course', label: '疗程', icon: Clock },
];

export default function CouponRecommend() {
  const { customerId = '' } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | CouponType>('all');
  const { getCustomerById, getCouponsByCustomerId, selectedCouponIds } = useAppStore();

  const customer = getCustomerById(customerId);
  const allCoupons = getCouponsByCustomerId(customerId);

  const filteredCoupons = activeTab === 'all' ? allCoupons : allCoupons.filter((c) => c.type === activeTab);
  const recommendedCoupons = allCoupons.filter((c) => c.isRecommended);
  const selectedCoupons = allCoupons.filter((c) => selectedCouponIds.includes(c.id));
  const totalFaceValue = selectedCoupons.reduce((sum, c) => sum + c.faceValue, 0);

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="顾客卡券" showBack />
        <div className="p-8 text-center text-gray-500">顾客信息不存在</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-32">
      <PageHeader
        title="卡券推荐"
        subtitle={`${customer.name} · 共${allCoupons.length}张可用`}
        showBack
      />

      <div className="px-4 pt-4 space-y-4">
        <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-card">
          <img
            src={customer.avatar}
            alt={customer.name}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-pink-100"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{customer.name}</span>
              <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-[11px] rounded-full">
                {customer.vipLevel}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{customer.phone}</div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300" />
        </div>

        {recommendedCoupons.length > 0 && activeTab === 'all' && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 px-1">
              <Sparkles className="w-4 h-4 text-brand-purple" />
              <span className="text-sm font-semibold text-gray-900">智能推荐</span>
              <span className="text-xs text-gray-400 ml-1">基于本次面诊方案</span>
            </div>
            <div className="space-y-3">
              {recommendedCoupons.map((coupon, index) => (
                <div
                  key={coupon.id}
                  style={{ animationDelay: `${index * 80}ms` }}
                  className="animate-[fadeInUp_0.4s_ease-out_both]"
                >
                  <CouponCard coupon={coupon} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="sticky top-[56px] z-30 -mx-4 px-4 py-3 bg-gradient-to-b from-gray-50 via-gray-50 to-transparent">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-purple to-brand-pink text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  <span className={`text-[11px] ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                    {tab.key === 'all'
                      ? allCoupons.length
                      : allCoupons.filter((c) => c.type === tab.key).length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          {filteredCoupons.length === 0 ? (
            <div className="py-16 text-center">
              <Ticket className="w-12 h-12 mx-auto text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">该分类下暂无卡券</p>
            </div>
          ) : (
            filteredCoupons
              .filter((c) => !c.isRecommended || activeTab !== 'all')
              .map((coupon, index) => (
                <div
                  key={coupon.id}
                  style={{ animationDelay: `${index * 60}ms` }}
                  className="animate-[fadeInUp_0.4s_ease-out_both]"
                >
                  <CouponCard coupon={coupon} />
                </div>
              ))
          )}
        </div>
      </div>

      {selectedCouponIds.length > 0 && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-100 px-4 py-3 pb-5 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500">
                已选择 <span className="font-semibold text-brand-purple">{selectedCouponIds.length}</span> 张券
              </div>
              <div className="text-sm font-semibold text-gray-900">
                合计面额 <span className="text-brand-purple">¥{totalFaceValue.toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={() => navigate(`/verify/${customerId}`)}
              className="px-6 h-12 bg-gradient-to-r from-brand-purple to-brand-pink text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-200"
            >
              发起核销
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
