import { Check, Clock, Sparkles } from 'lucide-react';
import type { Coupon, CouponType } from '@/types';
import { useAppStore } from '../store/appStore';

interface CouponCardProps {
  coupon: Coupon;
  selectable?: boolean;
}

const typeConfig: Record<CouponType, { label: string; bgColor: string; borderColor: string }> = {
  project_card: { label: '项目卡', bgColor: 'bg-purple-50', borderColor: 'border-brand-purple' },
  activity_coupon: { label: '活动券', bgColor: 'bg-pink-50', borderColor: 'border-brand-pink' },
  birthday_coupon: { label: '生日券', bgColor: 'bg-amber-50', borderColor: 'border-amber-400' },
  treatment_course: { label: '剩余疗程', bgColor: 'bg-green-50', borderColor: 'border-success' },
};

export default function CouponCard({ coupon, selectable = true }: CouponCardProps) {
  const { selectedCouponIds, toggleCouponSelection } = useAppStore();
  const isSelected = selectedCouponIds.includes(coupon.id);
  const config = typeConfig[coupon.type];
  const progress = Math.round((coupon.remainingCount / coupon.totalCount) * 100);

  return (
    <div
      onClick={() => selectable && toggleCouponSelection(coupon.id)}
      className={`relative overflow-hidden rounded-2xl transition-all duration-300 cursor-pointer ${
        isSelected
          ? 'ring-2 ring-brand-purple shadow-lg scale-[1.01] bg-white'
          : 'bg-white shadow-card hover:shadow-md'
      }`}
    >
      {coupon.isRecommended && (
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-brand-purple to-brand-pink text-white text-[10px] font-medium rounded-full">
          <Sparkles className="w-3 h-3" />
          推荐优先使用
        </div>
      )}

      {selectable && (
        <div
          className={`absolute top-3 left-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-brand-purple border-brand-purple'
              : 'bg-white border-gray-300'
          }`}
        >
          {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
        </div>
      )}

      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${config.bgColor} ${config.borderColor} border-r-2`} />

      <div className="pl-5 pr-4 pt-4 pb-4">
        <div className="flex items-start gap-2 mb-2">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${config.bgColor} text-gray-700`}>
            {config.label}
          </span>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {coupon.expireDate}到期
          </span>
        </div>

        <h4 className="text-base font-semibold text-gray-900 mb-2 pr-16">{coupon.name}</h4>

        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-[11px] text-gray-400">¥</span>
          <span className="text-2xl font-bold text-brand-purple">{coupon.faceValue.toLocaleString()}</span>
          {coupon.remainingCount > 1 && (
            <span className="ml-2 text-xs text-gray-500">
              剩余 <span className="font-semibold text-gray-700">{coupon.remainingCount}</span>/{coupon.totalCount} 次
            </span>
          )}
        </div>

        {coupon.totalCount > 1 && (
          <div className="mb-3">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-purple to-brand-pink rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {coupon.applicableItems.slice(0, 2).map((item) => (
            <span key={item} className="px-2 py-0.5 bg-gray-50 text-gray-500 text-[10px] rounded">
              {item}
            </span>
          ))}
          {coupon.applicableItems.length > 2 && (
            <span className="px-2 py-0.5 bg-gray-50 text-gray-400 text-[10px] rounded">
              +{coupon.applicableItems.length - 2}
            </span>
          )}
        </div>

        {coupon.isRecommended && coupon.recommendReason && (
          <div className="mt-3 p-2.5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
            <p className="text-[11px] text-purple-700 leading-relaxed">
              <Sparkles className="w-3 h-3 inline mr-1" />
              {coupon.recommendReason}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
