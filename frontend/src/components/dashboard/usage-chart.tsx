'use client';

import { formatNumber, formatShortDate } from '@/lib/format';
import type { UsagePoint } from '@/types/domain';
import { memo, useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type UsageChartProps = {
  series: UsagePoint[];
};

export const UsageChart = memo(function UsageChart({ series }: UsageChartProps) {
  const data = useMemo(
    () => series.map((point) => ({ ...point, label: formatShortDate(point.date) })),
    [series],
  );

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#e3d9c8" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: '#6d6458', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            interval={4}
          />
          <YAxis
            tick={{ fill: '#6d6458', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(value: number) => formatNumber(value)}
          />
          <Tooltip
            formatter={(value) => [formatNumber(Number(value)), 'Peticiones']}
            labelFormatter={(label) => String(label)}
            contentStyle={{
              borderRadius: 12,
              borderColor: '#e3d9c8',
              background: '#fffdf8',
            }}
          />
          <Area
            type="monotone"
            dataKey="requests"
            stroke="#c4532a"
            fill="#c4532a"
            fillOpacity={0.16}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});
