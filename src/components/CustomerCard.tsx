import { ChevronRight, Calendar, Star, Ticket } from 'lucide-react';
import type { Customer } from '@/types';

interface CustomerCardProps {
  customer: Customer;
  onClick?: () => void;
  onVerifyClick?: () => void;
  showChevron?: boolean;
  showVerifyButton?: boolean;
}

const vipStyles: Record<string, string> = {
  '普通': 'bg-gray-100 text-gray-600',
  '银卡': 'bg-gray-200 text-gray-700',
  '金卡': 'bg-amber-100 text-amber-700',
  '钻石': 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700',
};

export default function CustomerCard({
  customer,
  onClick,
  onVerifyClick,
  showChevron = true,
  showVerifyButton = true,
}: CustomerCardProps) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-card hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.99] relative overflow-hidden"
    >
      <img
        src={customer.avatar}
        alt={customer.name}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0 pr-16">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base font-semibold text-gray-900 truncate">{customer.name}</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${vipStyles[customer.vipLevel]}`}>
            {customer.vipLevel}
          </span>
          {customer.vipLevel !== '普通' && (
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>{customer.phone}</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            到院{customer.visitCount}次
          </span>
        </div>
        <div className="mt-1 text-[11px] text-gray-400">
          最近到院：{customer.lastVisitDate}
        </div>
      </div>
      {showVerifyButton && onVerifyClick && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onVerifyClick();
          }}
          className="absolute right-3 bottom-3 flex items-center gap-1 px-2.5 h-8 rounded-xl bg-gradient-to-r from-brand-purple to-brand-pink text-white text-xs font-medium shadow-sm"
        >
          <Ticket className="w-3 h-3" />
          核销
        </button>
      )}
      {!showVerifyButton && showChevron && <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />}
    </div>
  );
}
