import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  trend?: number;
  gradient: string;
  icon?: React.ReactNode;
}

export default function StatCard({ label, value, prefix, suffix, trend, gradient, icon }: StatCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-4 text-white ${gradient} shadow-card`}>
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute -right-4 -bottom-8 w-20 h-20 rounded-full bg-white/5" />

      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-white/80">{label}</span>
          {icon && <div className="text-white/80">{icon}</div>}
        </div>

        <div className="flex items-baseline gap-0.5 mb-1.5">
          {prefix && <span className="text-sm font-medium text-white/80">{prefix}</span>}
          <span className="text-2xl font-bold tracking-tight">{value}</span>
          {suffix && <span className="text-xs text-white/80 ml-0.5">{suffix}</span>}
        </div>

        {trend !== undefined && (
          <div className="flex items-center gap-1">
            {trend >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span className="text-[11px] text-white/90 font-medium">
              较上周 {trend >= 0 ? '+' : ''}{trend}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
