import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, ShoppingBag, Calendar, Users,
  Clock, ChevronRight, Phone, MessageCircle,
  TrendingUp, XCircle, CheckCircle2
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import TabBar from '../components/TabBar';
import { useAppStore } from '../store/appStore';
import type { FollowUpType, FollowUpItem } from '@/types';

type TabKey = 'all' | FollowUpType;

const typeConfig: Record<FollowUpType, {
  label: string;
  icon: typeof AlertTriangle;
  color: string;
  bg: string;
  border: string;
}> = {
  no_verify: {
    label: '到院未核销',
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  repurchase: {
    label: '复购意向',
    icon: ShoppingBag,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
  refund_risk: {
    label: '退款风险',
    icon: AlertTriangle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
  return_visit: {
    label: '复诊提醒',
    icon: Calendar,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
};

const tabs: { key: TabKey; label: string; icon?: typeof Users }[] = [
  { key: 'all', label: '全部' },
  { key: 'refund_risk', label: '退款风险' },
  { key: 'no_verify', label: '未核销' },
  { key: 'repurchase', label: '复购' },
  { key: 'return_visit', label: '复诊' },
];

const priorityLabels: Record<number, { label: string; color: string }> = {
  1: { label: '紧急', color: 'bg-red-500' },
  2: { label: '重要', color: 'bg-amber-500' },
  3: { label: '普通', color: 'bg-gray-400' },
};

export default function FollowUp() {
  const navigate = useNavigate();
  const { followUpItems, updateFollowUpStatus } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabKey>('all');

  const filteredItems = followUpItems
    .filter((item) => (activeTab === 'all' ? true : item.type === activeTab))
    .sort((a, b) => a.priority - b.priority);

  const stats = {
    total: followUpItems.length,
    pending: followUpItems.filter((f) => f.status === 'pending').length,
    refundRisk: followUpItems.filter((f) => f.type === 'refund_risk').length,
  };

  const handleStatusChange = (itemId: string, status: FollowUpItem['status']) => {
    updateFollowUpStatus(itemId, status);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      <PageHeader title="复购跟进" subtitle="智能提醒，高效转化" />

      <div className="px-4 pt-4 space-y-4">
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white">
            <Users className="w-5 h-5 mb-1.5 opacity-90" />
            <div className="text-xl font-bold">{stats.total}</div>
            <div className="text-[11px] opacity-80">待跟进总数</div>
          </div>
          <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl text-white">
            <Clock className="w-5 h-5 mb-1.5 opacity-90" />
            <div className="text-xl font-bold">{stats.pending}</div>
            <div className="text-[11px] opacity-80">待处理</div>
          </div>
          <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl text-white">
            <AlertTriangle className="w-5 h-5 mb-1.5 opacity-90" />
            <div className="text-xl font-bold">{stats.refundRisk}</div>
            <div className="text-[11px] opacity-80">退款风险</div>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            const count =
              tab.key === 'all'
                ? followUpItems.length
                : followUpItems.filter((f) => f.type === tab.key).length;
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
                {tab.label}
                <span className={`text-[11px] ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {filteredItems.length === 0 ? (
          <div className="py-20 text-center">
            <CheckCircle2 className="w-14 h-14 mx-auto text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">该分类下暂无跟进事项</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item, index) => {
              const cfg = typeConfig[item.type];
              const Icon = cfg.icon;
              const priority = priorityLabels[item.priority];
              const isRisk = item.type === 'refund_risk';

              return (
                <div
                  key={item.id}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className={`animate-[fadeInUp_0.4s_ease-out_both] relative overflow-hidden rounded-2xl transition-all hover:shadow-lg ${
                    isRisk ? 'bg-white border-2 border-red-200' : 'bg-white shadow-card'
                  }`}
                >
                  {isRisk && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 via-red-500 to-red-400 animate-pulse" />
                  )}

                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <img
                        src={item.customerAvatar}
                        alt={item.customerName}
                        className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{item.customerName}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] text-white font-medium ${priority.color}`}>
                            {priority.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className={`flex items-center gap-1 ${cfg.color}`}>
                            <Icon className="w-3 h-3" />
                            {cfg.label}
                          </span>
                          <span>·</span>
                          <span>{item.createdAt.slice(5, 16)}</span>
                        </div>
                      </div>
                    </div>

                    <h4 className={`text-sm font-semibold mb-1.5 ${isRisk ? 'text-red-600' : 'text-gray-900'}`}>
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">{item.content}</p>

                    {item.stayDuration && (
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          已停留{item.stayDuration}
                        </span>
                        {item.consultedProject && (
                          <span>咨询：{item.consultedProject}</span>
                        )}
                      </div>
                    )}

                    {item.historicalConsumption !== undefined && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                        历史消费 <span className="font-semibold text-gray-700">¥{item.historicalConsumption.toLocaleString()}</span>
                      </div>
                    )}

                    {item.refundAmount !== undefined && (
                      <div className="p-2.5 bg-red-50 rounded-xl mb-3 flex items-center justify-between">
                        <span className="text-xs text-red-600">预计退款金额</span>
                        <span className="text-sm font-bold text-red-600">¥{item.refundAmount.toLocaleString()}</span>
                      </div>
                    )}

                    {item.suggestNextVisit && (
                      <div className="p-2.5 bg-emerald-50 rounded-xl mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span className="text-xs text-emerald-700">
                          建议复诊时间：<span className="font-semibold">{item.suggestNextVisit}</span>
                        </span>
                      </div>
                    )}

                    {item.suggestedItems && item.suggestedItems.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {item.suggestedItems.map((it) => (
                          <span key={it} className="px-2 py-1 bg-purple-50 text-purple-600 text-[11px] rounded-lg">
                            {it}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                      {item.status === 'pending' && (
                        <>
                          <button className="flex-1 h-9 flex items-center justify-center gap-1.5 bg-gray-50 text-gray-600 text-xs font-medium rounded-xl hover:bg-gray-100">
                            <Phone className="w-3.5 h-3.5" />
                            电话联系
                          </button>
                          <button className="flex-1 h-9 flex items-center justify-center gap-1.5 bg-gray-50 text-gray-600 text-xs font-medium rounded-xl hover:bg-gray-100">
                            <MessageCircle className="w-3.5 h-3.5" />
                            发送消息
                          </button>
                          <button
                            onClick={() => handleStatusChange(item.id, 'processing')}
                            className="flex-1 h-9 bg-gradient-to-r from-brand-purple to-brand-pink text-white text-xs font-medium rounded-xl"
                          >
                            开始跟进
                          </button>
                        </>
                      )}
                      {item.status === 'processing' && (
                        <>
                          <button
                            onClick={() => navigate(`/coupons/${item.customerId}`)}
                            className="flex-1 h-9 flex items-center justify-center gap-1.5 bg-gradient-to-r from-brand-purple to-brand-pink text-white text-xs font-medium rounded-xl"
                          >
                            去核销
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(item.id, 'done')}
                            className="flex-1 h-9 flex items-center justify-center gap-1.5 bg-emerald-500 text-white text-xs font-medium rounded-xl"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            标记完成
                          </button>
                        </>
                      )}
                      {item.status === 'done' && (
                        <div className="flex items-center gap-1.5 w-full py-2 text-emerald-600">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-sm font-medium">已完成跟进</span>
                        </div>
                      )}
                      {item.status !== 'done' && (
                        <button
                          onClick={() => handleStatusChange(item.id, 'done')}
                          className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      )}
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
