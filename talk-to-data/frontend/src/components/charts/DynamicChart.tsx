'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface Props {
  type: 'bar' | 'line' | 'pie' | 'stat';
  data: Record<string, unknown>[];
  columns: string[];
}

const COLORS = ['#3ECF8E', '#60a5fa', '#f59e0b', '#ef4444', '#a78bfa'];

export function DynamicChart({ type, data, columns }: Props) {
  if (!data.length || columns.length < 1) {
    return (
      <div className="bg-zinc-950 rounded-lg p-6 text-center text-zinc-500 text-sm">
        No chart data
      </div>
    );
  }

  if (columns.length === 1 || type === 'stat') {
    const val = data[0] ? Object.values(data[0])[0] : '-';
    return (
      <div className="bg-zinc-950 rounded-lg p-6 text-center">
        <p className="text-4xl font-bold text-[#3ECF8E]">{String(val)}</p>
        <p className="text-zinc-500 text-xs mt-1">{columns[0] || 'result'}</p>
      </div>
    );
  }

  const xKey = columns[0];
  const yKey = columns[1];

  if (type === 'pie') {
    return (
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data as { [k: string]: string | number }[]}
            dataKey={yKey}
            nameKey={xKey}
            cx="50%"
            cy="50%"
            outerRadius={80}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: '#18181b',
              border: '1px solid #3f3f46',
              borderRadius: 8,
            }}
            labelStyle={{ color: '#fff' }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey={xKey} tick={{ fill: '#71717a', fontSize: 11 }} />
          <YAxis tick={{ fill: '#71717a', fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              background: '#18181b',
              border: '1px solid #3f3f46',
              borderRadius: 8,
            }}
          />
          <Line
            type="monotone"
            dataKey={yKey}
            stroke="#3ECF8E"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis dataKey={xKey} tick={{ fill: '#71717a', fontSize: 11 }} />
        <YAxis tick={{ fill: '#71717a', fontSize: 11 }} />
        <Tooltip
          contentStyle={{
            background: '#18181b',
            border: '1px solid #3f3f46',
            borderRadius: 8,
          }}
        />
        <Bar dataKey={yKey} fill="#3ECF8E" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
