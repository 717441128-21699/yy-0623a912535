import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock, MapPin, Calendar, User, AlertTriangle, Bell } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import CustomerCard from '../components/CustomerCard';
import TabBar from '../components/TabBar';
import { useAppStore } from '../store/appStore';

export default function CustomerSearch() {
  const navigate = useNavigate();
  const {
    searchKeyword, setSearchKeyword, getFilteredCustomers, consultant,
    getPendingVerifyCount, getActiveFollowUpCount, getActiveRefundRiskCount,
    getActiveNoVerifyCount,
  } = useAppStore();
  const [isFocused, setIsFocused] = useState(false);
  const filteredCustomers = getFilteredCustomers();

  const pendingDoctorCount = getPendingVerifyCount();
  const pendingFollowCount = getActiveFollowUpCount();
  const refundRiskCount = getActiveRefundRiskCount();
  const noVerifyCount = getActiveNoVerifyCount();

  const handleCustomerClick = (customerId: string) => {
    navigate(`/customer/${customerId}`);
  };

  const handleVerifyClick = (customerId: string) => {
    navigate(`/coupons/${customerId}`);
  };

  const todayStr = new Date().toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const hasReminders = pendingDoctorCount > 0 || refundRiskCount > 0 || noVerifyCount > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      <PageHeader
        title="核销助手"
        subtitle={todayStr}
        rightSlot={
          <div className="flex items-center gap-2">
            {hasReminders && (
              <button
                onClick={() => navigate('/follow-up')}
                className="relative w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm"
              >
                <Bell className="w-4.5 h-4.5 text-gray-600" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {pendingDoctorCount + refundRiskCount + noVerifyCount}
                </span>
              </button>
            )}
            <img
              src={consultant.avatar}
              alt={consultant.name}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-100 to-pink-100"
            />
          </div>
        }
      />

      <div className="px-4 pt-4 space-y-4">
        <div className="relative">
          <div
            className={`flex items-center gap-2 px-4 h-12 rounded-2xl bg-white border-2 transition-all duration-200 ${
              isFocused ? 'border-brand-purple shadow-card' : 'border-gray-100'
            }`}
          >
            <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="搜索手机号、姓名或预约单号"
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
            />
            {searchKeyword && (
              <button
                onClick={() => setSearchKeyword('')}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-gray-500" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white">
            <Clock className="w-5 h-5 mb-1.5 opacity-90" />
            <div className="text-xl font-bold">8</div>
            <div className="text-[11px] opacity-80">今日预约</div>
          </div>
          <div className="p-3 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl text-white">
            <MapPin className="w-5 h-5 mb-1.5 opacity-90" />
            <div className="text-xl font-bold">5</div>
            <div className="text-[11px] opacity-80">已签到</div>
          </div>
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl text-white">
            <User className="w-5 h-5 mb-1.5 opacity-90" />
            <div className="text-xl font-bold">3</div>
            <div className="text-[11px] opacity-80">已核销</div>
          </div>
        </div>

        {hasReminders && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              待处理提醒
            </h2>
            <div className="space-y-2">
              {pendingDoctorCount > 0 && (
                <button
                  onClick={() => navigate('/orders')}
                  className="w-full flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-left hover:bg-amber-100 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-amber-800">待医生确认</div>
                    <div className="text-xs text-amber-600">{pendingDoctorCount} 单待确认</div>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                    {pendingDoctorCount}
                  </span>
                </button>
              )}
              {refundRiskCount > 0 && (
                <button
                  onClick={() => navigate('/follow-up')}
                  className="w-full flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-200 text-left hover:bg-red-100 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-red-800">退款风险预警</div>
                    <div className="text-xs text-red-600">{refundRiskCount} 位顾客需关注</div>
                  </div>
                  <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                    {refundRiskCount}
                  </span>
                </button>
              )}
              {noVerifyCount > 0 && (
                <button
                  onClick={() => navigate('/follow-up')}
                  className="w-full flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-200 text-left hover:bg-purple-100 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-purple-800">到院未核销</div>
                    <div className="text-xs text-purple-600">{noVerifyCount} 位顾客待核销</div>
                  </div>
                  <span className="px-2.5 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">
                    {noVerifyCount}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-brand-purple" />
              {searchKeyword ? '搜索结果' : '今日到院顾客'}
            </h2>
            <span className="text-xs text-gray-500">
              共 <span className="font-semibold text-gray-700">{filteredCustomers.length}</span> 位
            </span>
          </div>

          {filteredCustomers.length === 0 ? (
            <div className="py-16 text-center">
              <Search className="w-12 h-12 mx-auto text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">暂无匹配的顾客</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCustomers.map((customer, index) => (
                <div
                  key={customer.id}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className="animate-[fadeInUp_0.4s_ease-out_both]"
                >
                  <CustomerCard
                    customer={customer}
                    onClick={() => handleCustomerClick(customer.id)}
                    onVerifyClick={() => handleVerifyClick(customer.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <TabBar />
    </div>
  );
}
