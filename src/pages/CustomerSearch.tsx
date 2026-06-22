import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock, MapPin, Calendar, User } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import CustomerCard from '../components/CustomerCard';
import TabBar from '../components/TabBar';
import { useAppStore } from '../store/appStore';

export default function CustomerSearch() {
  const navigate = useNavigate();
  const { searchKeyword, setSearchKeyword, getFilteredCustomers, consultant } = useAppStore();
  const [isFocused, setIsFocused] = useState(false);
  const filteredCustomers = getFilteredCustomers();

  const handleCustomerClick = (customerId: string) => {
    navigate(`/coupons/${customerId}`);
  };

  const todayStr = new Date().toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      <PageHeader
        title="核销助手"
        subtitle={todayStr}
        rightSlot={
          <div className="flex items-center gap-2">
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
