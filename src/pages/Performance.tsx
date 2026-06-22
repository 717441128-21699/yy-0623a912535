import { useState } from 'react';
import {
  BarChart3, Wallet, Users, TrendingUp,
  Calendar, ChevronDown, Ticket, ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, PieChart, Pie, Cell
} from 'recharts';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import TabBar from '../components/TabBar';
import { useAppStore } from '../store/appStore';

type Period = 'day' | 'week' | 'month';

export default function Performance() {
  const { consultant, dailyPerformance, projectConsumption, verifyOrders } = useAppStore();
  const [period, setPeriod] = useState<Period>('month');
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);

  const periodLabels: Record<Period, string> = {
    day: '今日',
    week: '本周',
    month: '本月',
  };

  const totalVerifyCount = dailyPerformance.reduce((sum, d) => sum + d.verifyCount, 0);
  const totalConsumeAmount = dailyPerformance.reduce((sum, d) => sum + d.consumeAmount, 0);
  const avgOrderValue = totalVerifyCount > 0 ? Math.round(totalConsumeAmount / totalVerifyCount) : 0;
  const repurchaseRate = 68;

  const recentOrders = verifyOrders.filter((o) => o.status === 'success').slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      <PageHeader
        title="个人业绩"
        rightSlot={
          <div className="relative">
            <button
              onClick={() => setShowPeriodPicker(!showPeriodPicker)}
              className="flex items-center gap-1 px-3 h-8 rounded-xl bg-gray-100 text-sm text-gray-700 font-medium"
            >
              <Calendar className="w-3.5 h-3.5" />
              {periodLabels[period]}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showPeriodPicker && (
              <div className="absolute right-0 top-10 w-28 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                {(Object.keys(periodLabels) as Period[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setPeriod(p);
                      setShowPeriodPicker(false);
                    }}
                    className={`w-full px-3 py-2 text-sm text-left ${
                      period === p ? 'text-brand-purple font-medium bg-purple-50' : 'text-gray-600'
                    }`}
                  >
                    {periodLabels[p]}
                  </button>
                ))}
              </div>
            )}
          </div>
        }
      />

      <div className="px-4 pt-4 space-y-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-purple via-purple-500 to-brand-pink text-white shadow-lg relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -right-4 bottom-0 w-32 h-32 rounded-full bg-white/5" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={consultant.avatar}
                alt={consultant.name}
                className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/30"
              />
              <div>
                <div className="font-semibold">{consultant.name}</div>
                <div className="text-xs text-white/80">工号：{consultant.employeeNo}</div>
              </div>
            </div>

            <div className="text-xs text-white/80 mb-1">{periodLabels[period]}核销总金额</div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs">¥</span>
              <span className="text-4xl font-bold tracking-tight">
                {totalConsumeAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-white/90">
              <TrendingUp className="w-3.5 h-3.5" />
              较上月增长 23.5%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="核销数量"
            value={totalVerifyCount}
            suffix="单"
            trend={15}
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
            icon={<Ticket className="w-5 h-5" />}
          />
          <StatCard
            label="客单价"
            value={avgOrderValue.toLocaleString()}
            prefix="¥"
            trend={8}
            gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
            icon={<Wallet className="w-5 h-5" />}
          />
          <StatCard
            label="复购率"
            value={repurchaseRate}
            suffix="%"
            trend={5}
            gradient="bg-gradient-to-br from-amber-500 to-orange-500"
            icon={<Users className="w-5 h-5" />}
          />
          <StatCard
            label="退款风险"
            value={29800}
            prefix="¥"
            gradient="bg-gradient-to-br from-rose-500 to-pink-600"
            icon={<BarChart3 className="w-5 h-5" />}
          />
        </div>

        <div className="p-4 bg-white rounded-2xl shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-brand-purple" />
              核销金额趋势
            </h3>
            <span className="text-xs text-gray-400">近22天</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyPerformance} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#A78BFA" />
                    <stop offset="100%" stopColor="#F472B6" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                  tickLine={false}
                  axisLine={false}
                  interval={3}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [`¥${value.toLocaleString()}`, '核销金额']}
                />
                <Line
                  type="monotone"
                  dataKey="consumeAmount"
                  stroke="url(#lineGradient)"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: '#A78BFA', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl shadow-card">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-brand-purple" />
            项目消耗占比
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-36 h-36 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectConsumption}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {projectConsumption.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {projectConsumption.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-gray-600 flex-1">{item.name}</span>
                  <span className="text-xs font-semibold text-gray-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
              <Ticket className="w-4 h-4 text-brand-purple" />
              最近核销
            </h3>
            <button className="text-xs text-brand-purple font-medium flex items-center gap-0.5">
              查看全部 <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-400">暂无核销记录</div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center gap-3 py-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-brand-purple">
                      {order.customerName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{order.couponName}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {order.customerName} · {order.createTime.slice(5, 16)}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-brand-purple">已核销</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <TabBar />
    </div>
  );
}
