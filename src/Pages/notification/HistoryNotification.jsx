import React, { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  Activity,
  BellRing,
  CheckCircle2,
  CircleOff,
  Eye,
  Filter,
  Search,
  Smartphone,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getNotificationCampaigns } from '../../Api';

const statusOptions = [
  { value: 'all', label: 'All status' },
  { value: 'SENT', label: 'Sent' },
  { value: 'PARTIAL', label: 'Partial' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'PROCESSING', label: 'Processing' },
];

const statusConfig = {
  SENT: {
    label: 'Sent',
    badge: 'bg-emerald-100 text-emerald-800',
    dot: 'bg-emerald-500',
  },
  PARTIAL: {
    label: 'Partial',
    badge: 'bg-amber-100 text-amber-800',
    dot: 'bg-amber-500',
  },
  PROCESSING: {
    label: 'Processing',
    badge: 'bg-sky-100 text-sky-800',
    dot: 'bg-sky-500',
  },
  FAILED: {
    label: 'Failed',
    badge: 'bg-rose-100 text-rose-800',
    dot: 'bg-rose-500',
  },
};

const HistoryNotification = ({ refreshKey = 0 }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [campaigns, setCampaigns] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadCampaigns = async () => {
      setIsLoading(true);
      const result = await getNotificationCampaigns(50);
      if (!isMounted) {
        return;
      }

      if (!result.ok) {
        toast.error(result.message);
        setIsLoading(false);
        return;
      }

      setCampaigns(result.data.campaigns || []);
      setSummary(result.data.summary || null);
      setIsLoading(false);
    };

    loadCampaigns();
    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const filteredCampaigns = useMemo(
    () =>
      campaigns.filter((campaign) => {
        const title = campaign.title?.toLowerCase() || '';
        const body = campaign.body?.toLowerCase() || '';
        const query = searchTerm.toLowerCase();
        const matchesSearch = title.includes(query) || body.includes(query);
        const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
        return matchesSearch && matchesStatus;
      }),
    [campaigns, filterStatus, searchTerm]
  );

  const cards = [
    {
      label: 'Total campaigns',
      value: summary?.totalCampaigns || 0,
      helper: 'Tracked promotional sends',
      icon: BellRing,
      tone: 'bg-slate-900 text-white',
    },
    {
      label: 'Delivery rate',
      value: `${summary?.deliveryRate || 0}%`,
      helper: `${summary?.deliveredCount || 0} delivered`,
      icon: CheckCircle2,
      tone: 'bg-emerald-50 text-emerald-900',
    },
    {
      label: 'Open rate',
      value: `${summary?.openRate || 0}%`,
      helper: `${summary?.openedCount || 0} opened in app`,
      icon: Eye,
      tone: 'bg-sky-50 text-sky-900',
    },
    {
      label: 'Failures',
      value: summary?.failedCount || 0,
      helper: 'Across recent campaigns',
      icon: CircleOff,
      tone: 'bg-rose-50 text-rose-900',
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white">
              <Activity className="h-3.5 w-3.5" />
              Insights
            </div>
            <h2 className="mt-2.5 text-xl font-semibold text-slate-900">Campaign performance</h2>
            <p className="mt-1.5 max-w-2xl text-sm leading-5 text-slate-500">
              Review the last 50 notification campaigns, inspect delivery quality, and spot
              campaigns that may need follow-up.
            </p>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-[minmax(0,1fr),200px]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search title or message"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-[1rem] border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
              />
            </label>

            <label className="relative block">
              <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full appearance-none rounded-[1rem] border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div key={card.label} className={`rounded-[1.15rem] p-3.5 shadow-sm ${card.tone}`}>
                <div className="flex items-start justify-between">
                  <div className="text-xs font-medium opacity-80">{card.label}</div>
                  <Icon className="h-4.5 w-4.5 opacity-75" />
                </div>
                <div className="mt-3 text-2xl font-semibold">{card.value}</div>
                <div className="mt-1.5 text-xs opacity-75">{card.helper}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white px-5 py-5">
        {isLoading ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-[1.35rem] border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
            Loading campaigns...
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[1.35rem] border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
            <div className="rounded-full bg-white p-3 shadow-sm">
              <BellRing className="h-7 w-7 text-slate-400" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900">No campaigns found</h3>
            <p className="mt-2 max-w-md text-sm leading-5 text-slate-500">
              Try a different search term or clear the status filter to see more campaign history.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCampaigns.map((campaign) => {
              const status = statusConfig[campaign.status] || statusConfig.PROCESSING;

              return (
                <article
                  key={campaign.id}
                  className="rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.badge}`}>
                          {status.label}
                        </span>
                        <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                          {campaign.audience?.label || campaign.audience?.type || 'Audience'}
                        </span>
                      </div>

                      <h3 className="mt-3 text-lg font-semibold text-slate-900">{campaign.title}</h3>
                      <p className="mt-2 max-w-3xl text-sm leading-5 text-slate-500">{campaign.body}</p>

                      <div className="mt-3 flex flex-wrap gap-2.5 text-xs text-slate-500">
                        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                          <Smartphone className="h-3.5 w-3.5" />
                          {campaign.metrics?.targetedDevices?.toLocaleString?.() || 0} active devices
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                          <Users className="h-3.5 w-3.5" />
                          {campaign.metrics?.targetedUsers?.toLocaleString?.() || 0} targeted users
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                          <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                          {campaign.sentAt
                            ? format(new Date(campaign.sentAt), 'dd MMM yyyy, hh:mm a')
                            : 'Not sent yet'}
                        </div>
                      </div>

                      {campaign.action?.type === 'OPEN_URL' && campaign.action?.url ? (
                        <a
                          href={campaign.action.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-cyan-700 hover:text-cyan-800"
                        >
                          <ExternalLink className="h-4 w-4" />
                          {campaign.action.url}
                        </a>
                      ) : null}
                    </div>

                    <div className="grid gap-2.5 sm:grid-cols-3 xl:w-[320px] xl:grid-cols-1">
                      <div className="rounded-[1rem] bg-emerald-50 p-3.5">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                          Delivered
                        </div>
                        <div className="mt-1.5 text-xl font-semibold text-emerald-900">
                          {campaign.metrics?.deliveredCount?.toLocaleString?.() || 0}
                        </div>
                      </div>
                      <div className="rounded-[1rem] bg-sky-50 p-3.5">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                          Opened
                        </div>
                        <div className="mt-1.5 text-xl font-semibold text-sky-900">
                          {campaign.metrics?.openedCount?.toLocaleString?.() || 0}
                        </div>
                      </div>
                      <div className="rounded-[1rem] bg-rose-50 p-3.5">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                          Failed
                        </div>
                        <div className="mt-1.5 text-xl font-semibold text-rose-900">
                          {campaign.metrics?.failedCount?.toLocaleString?.() || 0}
                        </div>
                      </div>
                    </div>
                  </div>

                  {campaign.failureSummary?.length ? (
                    <div className="mt-4 rounded-[1rem] border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-900">
                      Failure summary: {campaign.failureSummary.map((item) => `${item.code} (${item.count})`).join(', ')}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const Users = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ExternalLink = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
  </svg>
);

export default HistoryNotification;
