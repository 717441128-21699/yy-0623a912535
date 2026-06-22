import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Calendar, Phone, Award, User, Ticket,
  Stethoscope, Sparkles, MessageCircle, ChevronRight,
  CheckCircle2, Clock, XCircle,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import TabBar from '../components/TabBar';
import { useAppStore } from '../store/appStore';
import type { TimelineEventType } from '@/types';

const typeIcons: Record<TimelineEventType, typeof Ticket> = {
  verify: Ticket,
  doctor_confirm: Stethoscope,
  return_visit: Sparkles,
  follow_up: MessageCircle,
};

const typeColors: Record<TimelineEventType, string> = {
  verify: 'bg-gradient-to-br from-purple-500 to-pink-500 text-white',
  doctor_confirm: 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white',
  return_visit: 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white',
  follow_up: 'bg-gradient-to-br from-amber-500 to-orange-500 text-white',
};

const typeDotColors: Record<TimelineEventType, string> = {
  verify: 'bg-brand-purple',
  doctor_confirm: 'bg-blue-500',
  return_visit: 'bg-emerald-500',
  follow_up: 'bg-amber-500',
};

export default function CustomerDetail() {
  const { customerId = '' } = useParams();
  const navigate = useNavigate();
  const { getCustomerById, getCustomerTimeline, verifyOrders, followUpItems } = useAppStore();

  const customer = getCustomerById(customerId);
  const timeline = getCustomerTimeline(customerId);

  const customerOrders = useMemo(
    () => verifyOrders.filter((o) => o.customerId === customerId),
    [verifyOrders, customerId]
  );
  const customerFollowUps = useMemo(
    () => followUpItems.filter((f) => f.customerId === customerId),
    [followUpItems, customerId]
  );

  const totalSpent = customerOrders
    .filter((o) => o.status === 'success')
    .reduce((sum, o) => sum + o.couponFaceValue + o.priceDifference, 0);
  const successCount = customerOrders.filter((o) => o.status === 'success').length;
  const pendingFollows = customerFollowUps.filter((f) => f.status !== 'done').length;

  const handleTimelineClick = (relatedId?: string, relatedType?: 'verify' | 'follow_up') => {
    if (!relatedId || !relatedType) return;
    if (relatedType === 'verify') {
      navigate('/orders');
    } else {
      const item = followUpItems.find((f) => f.id === relatedId);
      navigate('/follow-up', {
        state: { highlightId: relatedId, highlightType: item?.type || 'return_visit' },
      });
    }
  };

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="客户详情" showBack />
        <div className="p-8 text-center text-gray-500">客户信息不存在</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      <PageHeader
        title="客户详情"
        showBack
        rightSlot={
          <button
            onClick={() => navigate(`/coupons/${customerId}`)}
            className="text-xs px-3 h-8 rounded-xl bg-gradient-to-r from-brand-purple to-brand-pink text-white font-medium flex items-center gap-1"
          >
            <Ticket className="w-3 h-3" />
            去核销
          </button>
        }
      />

      <div className="px-4 pt-4 space-y-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-purple via-purple-500 to-brand-pink text-white shadow-lg relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="relative flex items-start gap-4">
            <img
              src={customer.avatar}
              alt={customer.name}
              className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/30 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">{customer.name}</h2>
                <span className="px-2 py-0.5 text-[10px] rounded-full bg-white/20 flex items-center gap-1">
                  <Award className="w-2.5 h-2.5" />
                  {customer.vipLevel}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-1 text-xs text-white/80">
                <Phone className="w-3 h-3" />
                {customer.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}
              </div>
              <div className="mt-0.5 text-xs text-white/80">
                {customer.age}岁 · 到院 {customer.visitCount} 次
              </div>
            </div>
          </div>

          <div className="relative mt-5 grid grid-cols-3 gap-3 pt-4 border-t border-white/20">
            <div className="text-center">
              <div className="text-xl font-bold">¥{totalSpent.toLocaleString()}</div>
              <div className="text-[10px] text-white/70 mt-0.5">累计消费</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{successCount}</div>
              <div className="text-[10px] text-white/70 mt-0.5">核销成功</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{pendingFollows}</div>
              <div className="text-[10px] text-white/70 mt-0.5">待跟进</div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
              <User className="w-4 h-4 text-brand-purple" />
              基础信息
            </h3>
          </div>
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">最近到院</span>
              <span className="text-gray-900 font-medium">{customer.lastVisitDate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">到院次数</span>
              <span className="text-gray-900 font-medium">{customer.visitCount} 次</span>
            </div>
            {customer.appointmentNo && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">预约单号</span>
                <span className="text-gray-900 font-medium">{customer.appointmentNo}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between px-1 mb-2">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-brand-purple" />
              跟进时间线
            </h3>
            <span className="text-xs text-gray-400">共 {timeline.length} 条</span>
          </div>

          {timeline.length === 0 ? (
            <div className="p-10 bg-white rounded-2xl text-center">
              <Clock className="w-10 h-10 mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">暂无跟进记录</p>
            </div>
          ) : (
            <div className="relative pl-6">
              <div className="absolute left-2.5 top-2 bottom-2 w-px bg-gray-200" />
              {timeline.map((event, idx) => {
                const Icon = typeIcons[event.type];
                const isLast = idx === timeline.length - 1;
                return (
                  <div
                    key={event.id}
                    onClick={() => handleTimelineClick(event.relatedId, event.relatedType)}
                    className={`relative pb-4 ${isLast ? '' : ''} ${
                      event.relatedId ? 'cursor-pointer' : ''
                    }`}
                  >
                    <div
                      className={`absolute -left-4 top-0 w-7 h-7 rounded-full flex items-center justify-center shadow-md ${
                        typeColors[event.type]
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <div className="p-3.5 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">
                              {event.title}
                            </span>
                            {event.type === 'verify' && event.relatedType === 'verify' && (
                              <span className="text-[10px] text-brand-purple bg-purple-50 px-1.5 py-0.5 rounded">
                                核销单
                              </span>
                            )}
                            {event.type === 'return_visit' && (
                              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                复诊
                              </span>
                            )}
                            {event.type === 'doctor_confirm' && event.title.includes('通过') && (
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            )}
                            {event.type === 'doctor_confirm' && event.title.includes('驳回') && (
                              <XCircle className="w-3 h-3 text-red-500" />
                            )}
                          </div>
                          <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                            {event.description}
                          </p>
                          <div className="mt-1.5 text-[11px] text-gray-400 flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" />
                            {event.time}
                          </div>
                        </div>
                        {event.relatedId && (
                          <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
                        )}
                      </div>
                      {event.amount && (
                        <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between">
                          <span className="text-[11px] text-gray-400">核销金额</span>
                          <span className="text-sm font-bold text-brand-purple">
                            ¥{event.amount.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <TabBar />
    </div>
  );
}
