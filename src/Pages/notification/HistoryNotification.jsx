// HistoryNotification.jsx
import React, { useState } from 'react';

const HistoryNotification = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  // Mock data for demonstration
  const notifications = [
    {
      id: 1,
      title: 'New Feature Update',
      message: 'Check out our new feature that makes shopping easier!',
      sentTo: 'All Users',
      sentAt: '2024-01-15 10:30 AM',
      status: 'delivered',
      delivered: 12450,
      opened: 8765,
      failed: 23
    },
    {
      id: 2,
      title: 'Flash Sale Alert',
      message: '50% off on all items. Limited time offer!',
      sentTo: 'Active Users',
      sentAt: '2024-01-14 03:15 PM',
      status: 'delivered',
      delivered: 8760,
      opened: 6543,
      failed: 12
    },
    {
      id: 3,
      title: 'Welcome Bonus',
      message: 'Get ₹100 welcome bonus on your first order',
      sentTo: 'New Users',
      sentAt: '2024-01-13 09:00 AM',
      status: 'delivered',
      delivered: 2340,
      opened: 1876,
      failed: 5
    },
    {
      id: 4,
      title: 'Payment Reminder',
      message: 'Your subscription payment is due tomorrow',
      sentTo: 'Selected Users',
      sentAt: '2024-01-12 11:45 AM',
      status: 'pending',
      delivered: 0,
      opened: 0,
      failed: 0
    },
    {
      id: 5,
      title: 'Holiday Greetings',
      message: 'Wishing you and your family a happy holiday season!',
      sentTo: 'All Users',
      sentAt: '2024-01-11 08:00 AM',
      status: 'failed',
      delivered: 0,
      opened: 0,
      failed: 156
    }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      delivered: { bg: 'bg-green-100', text: 'text-green-800', label: 'Delivered' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Failed' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || notification.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header with Filters */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-800">Notification History</h2>
          
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Status</option>
              <option value="delivered">Delivered</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            {/* Date Range Filter */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>

            {/* Export Button */}
            <button className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm flex items-center gap-2">
              <span>📥</span> Export
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-600">Total Notifications</div>
            <div className="text-2xl font-bold text-gray-900">156</div>
            <div className="text-xs text-gray-500 mt-1">Last 30 days</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-600">Delivery Rate</div>
            <div className="text-2xl font-bold text-green-600">98.5%</div>
            <div className="text-xs text-gray-500 mt-1">+2.3% from last month</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-600">Open Rate</div>
            <div className="text-2xl font-bold text-blue-600">72.3%</div>
            <div className="text-xs text-gray-500 mt-1">+5.1% from last month</div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notification
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sent To
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sent At
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stats
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <tr key={notification.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium text-gray-900">{notification.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{notification.message}</div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {notification.sentTo}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {notification.sentAt}
                </td>
                <td className="px-4 py-3">
                  {getStatusBadge(notification.status)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col text-xs">
                    <span className="text-green-600">✓ {notification.delivered.toLocaleString()}</span>
                    <span className="text-blue-600">👁 {notification.opened.toLocaleString()}</span>
                    <span className="text-red-600">✗ {notification.failed.toLocaleString()}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    View
                  </button>
                  <button className="text-gray-600 hover:text-gray-800 text-sm">
                    Resend
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-gray-500">No notifications found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="border-t border-gray-200 px-4 py-3 bg-white flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of{' '}
          <span className="font-medium">20</span> results
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50">
            Previous
          </button>
          <button className="px-3 py-1 border border-blue-500 rounded-md text-sm text-white bg-blue-600">
            1
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50">
            2
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50">
            3
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryNotification;