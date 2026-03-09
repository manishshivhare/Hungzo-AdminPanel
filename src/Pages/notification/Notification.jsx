// Notification.jsx - Main Component
import React, { useState } from 'react';
import SendNotification from './SendNotification';
import HistoryNotification from './HistoryNotification';

const Notification = () => {
  const [activeView, setActiveView] = useState('send'); // 'send' or 'history'

  return (
    <div className="h-screen bg-gray-50 p-4 md:p-6 overflow-y-hidden">
      {/* Header */}
      <div className="mb-6 border-b border-gray-200 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notification Management</h1>
            <p className="mt-1 text-sm text-gray-600">
              Send push notifications to users and track delivery history
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-2 text-sm text-gray-600">
            <span>Logged in as</span>
            <span className="font-semibold text-blue-600">ADMIN</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-2">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6">
            <button
              onClick={() => setActiveView('send')}
              className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors duration-200 flex items-center gap-2 ${
                activeView === 'send'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>📨</span> Send Notification
            </button>
            {/* <button
              onClick={() => setActiveView('history')}
              className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors duration-200 flex items-center gap-2 ${
                activeView === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>📋</span> Notification History
            </button> */}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-240px)]">
        {activeView === 'send' ? <SendNotification /> : <HistoryNotification />}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-2 border-t border-gray-200 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Hungzo Admin Panel
      </div>
    </div>
  );
};

export default Notification;