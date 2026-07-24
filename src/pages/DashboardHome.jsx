import React from 'react';
import { FiUsers, FiActivity, FiDollarSign, FiTrendingUp } from 'react-icons/fi';

const StatCard = ({ title, value, change, icon: Icon, colorClass }) => (
  <div className="glass-panel p-6 rounded-2xl hover-elevate cursor-pointer">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <span className={`text-sm font-semibold ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
        {change}
      </span>
    </div>
    <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
  </div>
);

const DashboardHome = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Dashboard <span className="text-gradient">Overview</span>
        </h1>
        <p className="text-gray-500">Welcome back to your premium management panel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value="12,431"
          change="+12.5%"
          icon={FiUsers}
          colorClass="bg-gradient-to-br from-blue-500 to-indigo-600"
        />
        <StatCard
          title="Active Sessions"
          value="1,204"
          change="+5.2%"
          icon={FiActivity}
          colorClass="bg-gradient-to-br from-emerald-400 to-teal-500"
        />
        <StatCard
          title="Total Revenue"
          value="$84,230"
          change="+18.1%"
          icon={FiDollarSign}
          colorClass="bg-gradient-to-br from-purple-500 to-pink-500"
        />
        <StatCard
          title="Conversion Rate"
          value="4.6%"
          change="-0.4%"
          icon={FiTrendingUp}
          colorClass="bg-gradient-to-br from-orange-400 to-red-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Revenue Overview</h2>
          <div className="h-64 flex items-end gap-2 justify-between pt-8 border-b border-gray-100">
            {/* Mock Chart Bars */}
            {[40, 60, 45, 80, 55, 90, 70, 100, 85, 65, 75, 50].map((height, i) => (
              <div key={i} className="w-full bg-blue-100 rounded-t-sm relative group cursor-pointer" style={{ height: `${height}%` }}>
                <div className="absolute bottom-0 w-full bg-gradient-primary rounded-t-sm transition-all duration-300 group-hover:opacity-80" style={{ height: '100%' }}></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">New user registered</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
