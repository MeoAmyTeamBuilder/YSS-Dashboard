import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AllianceMember } from '../types';

interface PowerChartProps {
  members: AllianceMember[];
}

export const PowerChart = ({ members }: PowerChartProps) => {
  const ranges = [
    { label: '60-70M', min: 60000000, max: 70000000 },
    { label: '70-80M', min: 70000000, max: 80000000 },
    { label: '80-90M', min: 80000000, max: 90000000 },
    { label: '90-100M', min: 90000000, max: 100000000 },
    { label: '100-125M', min: 100000000, max: 125000000 },
    { label: '125-150M', min: 125000000, max: 150000000 },
    { label: '>150M', min: 150000000, max: Infinity },
  ];

  const data = ranges.map(range => ({
    range: range.label,
    count: members.filter(m => m.topPower >= range.min && m.topPower < range.max).length
  }));

  return (
    <div className="frost-glass p-4 rounded-xl md:rounded-2xl border-frost-500/10 h-full flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <h3 className="text-sm font-bold text-white">Power Distribution</h3>
        <span className="text-[10px] text-slate-400 uppercase tracking-wider">Member Count</span>
      </div>
      
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis 
              dataKey="range" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 10 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 10 }}
            />
            <Tooltip 
              cursor={{ fill: '#ffffff05' }}
              contentStyle={{ 
                backgroundColor: '#1a1a1a', 
                border: '1px solid #ffffff10',
                borderRadius: '12px',
                fontSize: '12px',
                color: '#fff'
              }}
              itemStyle={{ color: '#38bdf8' }}
            />
            <Bar 
              dataKey="count" 
              radius={[6, 6, 0, 0]}
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index % 2 === 0 ? '#38bdf8' : '#38bdf840'} 
                  className="hover:fill-frost-400 transition-colors duration-300"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
