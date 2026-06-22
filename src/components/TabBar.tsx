import { NavLink } from 'react-router-dom';
import { Search, ClipboardList, FileCheck, Users, BarChart3 } from 'lucide-react';
import { useAppStore } from '../store/appStore';

const navItems = [
  { path: '/', icon: Search, label: '顾客' },
  { path: '/orders', icon: FileCheck, label: '医嘱' },
  { path: '/follow-up', icon: Users, label: '跟进' },
  { path: '/performance', icon: BarChart3, label: '业绩' },
];

export default function TabBar() {
  const pendingDoctorCount = useAppStore(
    (s) => s.verifyOrders.filter((o) => o.status === 'pending_doctor').length
  );
  const pendingFollowCount = useAppStore(
    (s) => s.followUpItems.filter((f) => f.status !== 'done').length
  );

  const getBadge = (path: string) => {
    if (path === '/orders' && pendingDoctorCount > 0) return pendingDoctorCount;
    if (path === '/follow-up' && pendingFollowCount > 0) return pendingFollowCount;
    return 0;
  };

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-100 px-2 pt-2 pb-4 z-50">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const badge = getBadge(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center py-1 px-4 min-w-[64px] h-12 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-brand-purple'
                    : 'text-gray-400 hover:text-gray-600'
                }`
              }
            >
              <div className="relative">
                <Icon className="w-5 h-5" strokeWidth={2} />
                {badge > 0 && (
                  <span className="absolute -top-2 -right-3 min-w-[18px] h-[18px] px-1 bg-danger text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-0.5 font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
