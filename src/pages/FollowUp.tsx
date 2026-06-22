import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AlertTriangle, ShoppingBag, Calendar, Users,
  Clock, ChevronRight, Phone, MessageCircle,
  TrendingUp, CheckCircle2, Ticket,
  XCircle, Star, Zap, X, Edit2,
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
  dotColor: string;
}> = {
  no_verify: {
    label: '到院未核销',
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    dotColor: 'bg-amber-500',
  },
  repurchase: {
    label: '复购意向',
    icon: ShoppingBag,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    dotColor: 'bg-purple-500',
  },
  refund_risk: {
    label: '退款风险',
    icon: AlertTriangle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    dotColor: 'bg-red-500',
  },
  return_visit: {
    label: '复诊提醒',
    icon: Calendar,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    dotColor: 'bg-emerald-500',
  },
};

const tabs: { key: TabKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'no_verify', label: '未核销' },
  { key: 'repurchase', label: '复购' },
  { key: 'refund_risk', label: '退款' },
  { key: 'return_visit', label: '复诊' },
];

const priorityLabels: Record<number, { label: string; color: string }> = {
  1: { label: '紧急', color: 'bg-red-500' },
  2: { label: '重要', color: 'bg-amber-500' },
  3: { label: '普通', color: 'bg-gray-400' },
};

export default function FollowUp() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    followUpItems,
    updateFollowUpStatus,
    setSelectedCustomerId,
    updateFollowUpItem,
  } = useAppStore();

  const locationState = location.state as { highlightId?: string; highlightType?: FollowUpType } | null;
  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    if (locationState?.highlightType) return locationState.highlightType;
    if (locationState?.highlightId) return 'return_visit';
    return 'all';
  });
  const [highlightId, setHighlightId] = useState<string | null>(
    locationState?.highlightId || null
  );
  const highlightRef = useRef<HTMLDivElement>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const [editingItem, setEditingItem] = useState<FollowUpItem | null>(null);
  const [editNextDate, setEditNextDate] = useState('');
  const [editRemark, setEditRemark] = useState('');

  useEffect(() => {
    if (highlightId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      highlightTimerRef.current = setTimeout(() => {
        setHighlightId(null);
      }, 3000);
    }
    return () => {
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    };
  }, [highlightId]);

  useEffect(() => {
    if (locationState?.highlightId) {
      window.history.replaceState({}, document.title);
    }
  }, [locationState]);

  const filteredItems = followUpItems
    .filter((item) => (activeTab === 'all' ? true : item.type === activeTab))
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;
      return a.priority - b.priority;
    });

  const stats = {
    total: followUpItems.length,
    pending: followUpItems.filter((f) => f.status !== 'done').length,
    refundRisk: followUpItems.filter((f) => f.type === 'refund_risk' && f.status !== 'done').length,
    noVerify: followUpItems.filter((f) => f.type === 'no_verify' && f.status !== 'done').length,
    repurchase: followUpItems.filter((f) => f.type === 'repurchase' && f.status !== 'done').length,
  };

  const handleGoCoupons = (customerId: string) => {
    setSelectedCustomerId(customerId);
    navigate(`/coupons/${customerId}`);
  };

  const handleGoCustomerDetail = (customerId: string) => {
    navigate(`/customer/${customerId}`);
  };

  const handleOpenEditReturnVisit = (e: React.MouseEvent, item: FollowUpItem) => {
    e.stopPropagation();
    setEditingItem(item);
    setEditNextDate(item.suggestNextVisit || '');
    setEditRemark(item.remark || '');
  };

  const handleSaveEditReturnVisit = () => {
    if (!editingItem) return;
    updateFollowUpItem(editingItem.id, {
      suggestNextVisit: editNextDate || undefined,
      remark: editRemark.trim() || undefined,
    });
    setEditingItem(null);
  };

  const handleStartFollow = (itemId: string) => {
    updateFollowUpStatus(itemId, 'processing');
  };

  const handleMarkDone = (itemId: string) => {
    updateFollowUpStatus(itemId, 'done');
  };

  const handleMarkPending = (itemId: string) => {
    updateFollowUpStatus(itemId, 'pending');
  };

  const getActionButton = (item: FollowUpItem) => {
    if (item.status === 'done') {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleMarkPending(item.id);
          }}
          className="flex-1 h-9 flex items-center justify-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-xl hover:bg-gray-200"
        >
          <XCircle className="w-3.5 h-3.5" />
          重新跟进
        </button>
      );
    }

    if (item.type === 'no_verify' || item.type === 'repurchase') {
      return (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleGoCoupons(item.customerId);
            }}
            className="flex-1 h-9 flex items-center justify-center gap-1.5 bg-gradient-to-r from-brand-purple to-brand-pink text-white text-xs font-medium rounded-xl shadow-sm"
          >
            <Ticket className="w-3.5 h-3.5" />
            去核销
          </button>
          {item.status === 'pending' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStartFollow(item.id);
              }}
              className="flex-1 h-9 flex items-center justify-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-xl hover:bg-gray-200"
            >
              <Phone className="w-3.5 h-3.5" />
              电话联系
            </button>
          )}
          {item.status === 'processing' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMarkDone(item.id);
              }}
              className="flex-1 h-9 flex items-center justify-center gap-1.5 bg-emerald-500 text-white text-xs font-medium rounded-xl"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              已完成
            </button>
          )}
        </>
      );
    }

    if (item.type === 'refund_risk') {
      return (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStartFollow(item.id);
            }}
            className="flex-1 h-9 flex items-center justify-center gap-1.5 bg-red-500 text-white text-xs font-medium rounded-xl"
          >
            <Phone className="w-3.5 h-3.5" />
            立即处理
          </button>
          {item.status === 'processing' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMarkDone(item.id);
              }}
              className="flex-1 h-9 flex items-center justify-center gap-1.5 bg-emerald-500 text-white text-xs font-medium rounded-xl"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              已解决
            </button>
          )}
        </>
      );
    }

    if (item.type === 'return_visit') {
      return (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEditReturnVisit(e, item);
            }}
            className="flex-1 h-9 flex items-center justify-center gap-1.5 bg-white text-emerald-600 border border-emerald-200 text-xs font-medium rounded-xl hover:bg-emerald-50"
          >
            <Edit2 className="w-3.5 h-3.5" />
            改期备注
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleGoCoupons(item.customerId);
            }}
            className="flex-1 h-9 flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-medium rounded-xl"
          >
            <Calendar className="w-3.5 h-3.5" />
            预约复诊
          </button>
          {item.status === 'pending' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStartFollow(item.id);
              }}
              className="flex-1 h-9 flex items-center justify-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-xl hover:bg-gray-200"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              发消息
            </button>
          )}
          {item.status === 'processing' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMarkDone(item.id);
              }}
              className="flex-1 h-9 flex items-center justify-center gap-1.5 bg-emerald-500 text-white text-xs font-medium rounded-xl"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              已确认
            </button>
          )}
        </>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      <PageHeader title="复购跟进" subtitle="智能提醒 · 高效转化" />

      <div className="px-4 pt-4 space-y-4">
        <div className="grid grid-cols-4 gap-2">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-white">
            <Clock className="w-4 h-4 mb-1 opacity-90" />
            <div className="text-lg font-bold">{stats.noVerify}</div>
            <div className="text-[10px] opacity-80">未核销</div>
          </div>
          <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-500 text-white">
            <ShoppingBag className="w-4 h-4 mb-1 opacity-90" />
            <div className="text-lg font-bold">{stats.repurchase}</div>
            <div className="text-[10px] opacity-80">复购</div>
          </div>
          <div className="p-3 rounded-2xl bg-gradient-to-br from-red-400 to-red-500 text-white">
            <AlertTriangle className="w-4 h-4 mb-1 opacity-90" />
            <div className="text-lg font-bold">{stats.refundRisk}</div>
            <div className="text-[10px] opacity-80">退款</div>
          </div>
          <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-500 text-white">
            <Calendar className="w-4 h-4 mb-1 opacity-90" />
            <div className="text-lg font-bold">{stats.pending}</div>
            <div className="text-[10px] opacity-80">待跟进</div>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            const count =
              tab.key === 'all'
                ? followUpItems.filter((f) => f.status !== 'done').length
                : followUpItems.filter((f) => f.type === tab.key && f.status !== 'done').length;
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
            <p className="text-xs text-gray-300 mt-1">太棒了，继续保持！</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item, index) => {
              const cfg = typeConfig[item.type];
              const Icon = cfg.icon;
              const priority = priorityLabels[item.priority];
              const isRisk = item.type === 'refund_risk' && item.status !== 'done';
              const isDone = item.status === 'done';
              const isHighlighted = highlightId === item.id;

              return (
                <div
                  key={item.id}
                  ref={isHighlighted ? highlightRef : undefined}
                  onClick={() => handleGoCustomerDetail(item.customerId)}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className={`animate-[fadeInUp_0.4s_ease-out_both] relative overflow-hidden rounded-2xl transition-all hover:shadow-lg cursor-pointer ${
                    isHighlighted
                      ? 'bg-white ring-2 ring-brand-purple shadow-lg scale-[1.01]'
                      : isDone
                      ? 'bg-gray-50 opacity-75'
                      : isRisk
                      ? 'bg-white border-2 border-red-200 shadow-md'
                      : 'bg-white shadow-card'
                  }`}
                >
                  {isHighlighted && (
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-purple to-brand-pink animate-pulse" />
                  )}

                  {isRisk && item.priority === 1 && !isHighlighted && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 via-red-500 to-red-400 animate-pulse" />
                  )}

                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="relative">
                        <img
                          src={item.customerAvatar}
                          alt={item.customerName}
                          className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex-shrink-0"
                        />
                        <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full ${cfg.dotColor} border-2 border-white flex items-center justify-center`}>
                          <Icon className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{item.customerName}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] text-white font-medium ${priority.color}`}>
                            {priority.label}
                          </span>
                          {item.status === 'processing' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-600 font-medium">
                              跟进中
                            </span>
                          )}
                          {isDone && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-200 text-gray-500 font-medium">
                              已完成
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className={`flex items-center gap-1 ${cfg.color}`}>
                            {cfg.label}
                          </span>
                          <span>·</span>
                          <span>{item.createdAt.slice(5, 16)}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
                    </div>

                    <h4 className={`text-sm font-semibold mb-1.5 ${
                      isRisk ? 'text-red-600' : isDone ? 'text-gray-500' : 'text-gray-900'
                    }`}>
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">
                      {item.content}
                    </p>

                    {item.stayDuration && (
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          已停留{item.stayDuration}
                        </span>
                        {item.consultedProject && (
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-amber-500" />
                            {item.consultedProject}
                          </span>
                        )}
                      </div>
                    )}

                    {item.historicalConsumption !== undefined && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                        历史消费
                        <span className="font-semibold text-gray-700">
                          ¥{item.historicalConsumption.toLocaleString()}
                        </span>
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400 ml-1" />
                      </div>
                    )}

                    {item.refundAmount !== undefined && (
                      <div className={`p-2.5 rounded-xl mb-3 flex items-center justify-between ${
                        isDone ? 'bg-gray-50' : 'bg-red-50'
                      }`}>
                        <span className={`text-xs flex items-center gap-1 ${
                          isDone ? 'text-gray-500' : 'text-red-600'
                        }`}>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {isDone ? '原退款金额（已解决）' : '预计退款'}
                        </span>
                        <span className={`text-sm font-bold ${isDone ? 'text-gray-400 line-through' : 'text-red-600'}`}>
                          ¥{item.refundAmount.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {item.suggestNextVisit && (
                      <div className="p-2.5 bg-emerald-50 rounded-xl mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span className="text-xs text-emerald-700">
                          建议复诊：
                          <span className="font-semibold ml-1">{item.suggestNextVisit}</span>
                        </span>
                      </div>
                    )}

                    {item.remark && (
                      <div className="p-2.5 bg-blue-50 rounded-xl mb-3 flex items-start gap-2">
                        <MessageCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-blue-700 leading-relaxed">
                          <span className="font-semibold">备注：</span>{item.remark}
                        </div>
                      </div>
                    )}

                    {item.suggestedItems && item.suggestedItems.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {item.suggestedItems.map((it) => (
                          <span
                            key={it}
                            className="px-2 py-1 text-[11px] rounded-lg bg-purple-50 text-purple-600"
                          >
                            {it}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      {getActionButton(item)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editingItem && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditingItem(null)} />
          <div className="relative w-full max-w-[480px] bg-white rounded-t-3xl animate-[fadeInUp_0.3s_ease-out]">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">复诊改期 & 备注</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <img
                  src={editingItem.customerAvatar}
                  alt={editingItem.customerName}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100"
                />
                <div>
                  <div className="text-sm font-semibold text-gray-900">{editingItem.customerName}</div>
                  <div className="text-xs text-emerald-600">{editingItem.title}</div>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1.5 block flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  下次复诊日期
                </label>
                <input
                  type="date"
                  value={editNextDate}
                  onChange={(e) => setEditNextDate(e.target.value)}
                  className="w-full h-11 px-3 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1.5 block flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  沟通记录 / 备注
                </label>
                <textarea
                  value={editRemark}
                  onChange={(e) => setEditRemark(e.target.value)}
                  placeholder="记录顾客反馈、预约调整原因等沟通内容..."
                  rows={4}
                  className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-purple resize-none"
                />
              </div>
            </div>
            <div className="p-4 pb-6 flex gap-2 border-t border-gray-100">
              <button
                onClick={() => setEditingItem(null)}
                className="flex-1 h-12 bg-white text-gray-700 font-semibold rounded-2xl border border-gray-200"
              >
                取消
              </button>
              <button
                onClick={handleSaveEditReturnVisit}
                className="flex-[2] h-12 bg-gradient-to-r from-brand-purple to-brand-pink text-white font-semibold rounded-2xl shadow-lg flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      <TabBar />
    </div>
  );
}
