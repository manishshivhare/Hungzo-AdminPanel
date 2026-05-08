import React, { useState } from 'react';
import { History, Send } from 'lucide-react';
import SendNotification from './SendNotification';
import HistoryNotification from './HistoryNotification';

const tabs = [
  {
    id: 'send',
    label: 'Compose Campaign',
    description: 'Build and send a promotional push campaign.',
    icon: Send,
  },
  {
    id: 'history',
    label: 'Campaign History',
    description: 'Review delivery outcomes and recent performance.',
    icon: History,
  },
];

const Notification = () => {
  const [activeView, setActiveView] = useState('send');
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-full bg-slate-50 px-4 py-4 md:px-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-2.5 shadow-sm">
          <div className="grid gap-2.5 md:grid-cols-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeView === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveView(tab.id)}
                  className={`rounded-[1.25rem] border px-4 py-3 text-left transition ${
                    isActive
                      ? 'border-cyan-200 bg-cyan-50 shadow-sm'
                      : 'border-transparent bg-slate-50 hover:border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`rounded-xl p-2.5 ${
                        isActive ? 'bg-cyan-600 text-white' : 'bg-white text-slate-500'
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5">
                        <h2 className="text-sm font-semibold text-slate-900">{tab.label}</h2>
                        {isActive ? (
                          <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-800">
                            Active
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{tab.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
          {activeView === 'send' ? (
            <SendNotification
              onSent={() => {
                setRefreshKey((value) => value + 1);
                setActiveView('history');
              }}
            />
          ) : (
            <HistoryNotification refreshKey={refreshKey} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Notification;
