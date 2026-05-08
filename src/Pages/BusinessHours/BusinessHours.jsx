import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getStoreSettings, updateStoreSettings } from "../../Api";

const DAY_LABELS = [
  { key: "MONDAY", label: "Monday" },
  { key: "TUESDAY", label: "Tuesday" },
  { key: "WEDNESDAY", label: "Wednesday" },
  { key: "THURSDAY", label: "Thursday" },
  { key: "FRIDAY", label: "Friday" },
  { key: "SATURDAY", label: "Saturday" },
  { key: "SUNDAY", label: "Sunday" },
];

const buildDefaultWeeklyHours = () =>
  DAY_LABELS.map((day, index) => ({
    day: day.key,
    isOpen: index !== 6,
    isTwentyFourHours: false,
    openTime: "09:00",
    closeTime: "21:00",
  }));

const buildInitialForm = () => ({
  timezone: "Asia/Kolkata",
  weeklyHours: buildDefaultWeeklyHours(),
  temporaryClosure: {
    isClosed: false,
    reason: "",
  },
});

export default function BusinessHours() {
  const [form, setForm] = useState(buildInitialForm);
  const [storeStatus, setStoreStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadStoreSettings();
  }, []);

  const statusTone = useMemo(() => {
    if (storeStatus?.isOpen) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }

    return "bg-rose-50 text-rose-700 border-rose-200";
  }, [storeStatus]);

  async function loadStoreSettings() {
    setLoading(true);
    const response = await getStoreSettings();

    if (!response?.success) {
      toast.error(response?.message || "Failed to fetch store settings");
      setLoading(false);
      return;
    }

    setForm({
      timezone: response.settings?.timezone || "Asia/Kolkata",
      weeklyHours:
        response.settings?.weeklyHours?.length > 0
          ? response.settings.weeklyHours.map((entry) => ({
              ...entry,
              isTwentyFourHours: Boolean(entry?.isTwentyFourHours),
            }))
          : buildDefaultWeeklyHours(),
      temporaryClosure: {
        isClosed: Boolean(response.settings?.temporaryClosure?.isClosed),
        reason: response.settings?.temporaryClosure?.reason || "",
      },
    });
    setStoreStatus(response.storeStatus || null);
    setLoading(false);
  }

  function updateDay(day, patch) {
    setForm((current) => ({
      ...current,
      weeklyHours: current.weeklyHours.map((entry) =>
        entry.day === day ? { ...entry, ...patch } : entry
      ),
    }));
  }

  function toggleTwentyFourHours(day, enabled) {
    setForm((current) => ({
      ...current,
      weeklyHours: current.weeklyHours.map((entry) =>
        entry.day === day
          ? {
              ...entry,
              isOpen: enabled ? true : entry.isOpen,
              isTwentyFourHours: enabled,
            }
          : entry
      ),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);

    const response = await updateStoreSettings(form);

    if (!response?.success) {
      toast.error(response?.message || "Failed to update store settings");
      setSaving(false);
      return;
    }

    toast.success("Business hours updated");
    setStoreStatus(response.storeStatus || null);
    setSaving(false);
  }

  return (
    <div className="min-h-full bg-slate-50 px-6 py-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 p-6 text-white shadow-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-200">
                Store Availability
              </p>
              <h1 className="mt-2 text-3xl font-semibold">Business Hours</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-200">
                Define daily opening hours, mark closed days, and temporarily close the store when needed.
              </p>
            </div>
            {storeStatus && (
              <div className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold ${statusTone}`}>
                {storeStatus.statusLabel}: {storeStatus.message}
              </div>
            )}
          </div>
        </section>

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Weekly Schedule</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enable a day to open the store and define its opening and closing time.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    weeklyHours: buildDefaultWeeklyHours(),
                  }))
                }
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >
                Reset
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {form.weeklyHours.map((entry) => {
                const day = DAY_LABELS.find((item) => item.key === entry.day);

                return (
                  <div
                    key={entry.day}
                    className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_auto_auto_auto_auto]"
                  >
                    <div>
                      <p className="text-base font-semibold text-slate-900">{day?.label || entry.day}</p>
                      <p className="text-sm text-slate-500">
                        {entry.isOpen
                          ? entry.isTwentyFourHours
                            ? "Store stays open for the full day."
                            : "Store accepts orders on this day."
                          : "Store remains closed for the full day."}
                      </p>
                    </div>

                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={entry.isOpen}
                        onChange={(event) =>
                          updateDay(entry.day, {
                            isOpen: event.target.checked,
                            isTwentyFourHours: event.target.checked
                              ? entry.isTwentyFourHours
                              : false,
                          })
                        }
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      Open
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        toggleTwentyFourHours(entry.day, !entry.isTwentyFourHours)
                      }
                      className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                        entry.isTwentyFourHours
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      24x7
                    </button>

                    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                      Opening time
                      <input
                        type="time"
                        value={entry.openTime}
                        disabled={!entry.isOpen || entry.isTwentyFourHours}
                        onChange={(event) =>
                          updateDay(entry.day, { openTime: event.target.value })
                        }
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 disabled:bg-slate-100"
                      />
                    </label>

                    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                      Closing time
                      <input
                        type="time"
                        value={entry.closeTime}
                        disabled={!entry.isOpen || entry.isTwentyFourHours}
                        onChange={(event) =>
                          updateDay(entry.day, { closeTime: event.target.value })
                        }
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 disabled:bg-slate-100"
                      />
                    </label>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Temporary Closure</h2>
              <p className="mt-1 text-sm text-slate-500">
                Close the store instantly even if the weekly schedule says it should be open.
              </p>

              <label className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <input
                  type="checkbox"
                  checked={form.temporaryClosure.isClosed}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      temporaryClosure: {
                        ...current.temporaryClosure,
                        isClosed: event.target.checked,
                      },
                    }))
                  }
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <p className="font-semibold text-slate-900">Temporarily close store</p>
                  <p className="text-sm text-slate-500">
                    Users will see the store as unavailable and checkout will be blocked.
                  </p>
                </div>
              </label>

              <label className="mt-4 flex flex-col gap-2 text-sm font-medium text-slate-700">
                Closure note
                <textarea
                  rows="4"
                  value={form.temporaryClosure.reason}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      temporaryClosure: {
                        ...current.temporaryClosure,
                        reason: event.target.value,
                      },
                    }))
                  }
                  placeholder="Example: Closed for maintenance until evening."
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                />
              </label>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Timezone</h2>
              <p className="mt-1 text-sm text-slate-500">
                Hours are currently evaluated in the selected timezone.
              </p>

              <input
                type="text"
                value={form.timezone}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    timezone: event.target.value,
                  }))
                }
                className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
              />
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Current Status</h2>
              <p className="mt-1 text-sm text-slate-500">
                Live status visible to the user app.
              </p>

              {loading ? (
                <p className="mt-4 text-sm text-slate-500">Loading status...</p>
              ) : (
                <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    {storeStatus?.statusLabel || "Unknown"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {storeStatus?.message || "Status is not available right now."}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? "Saving..." : "Save Business Hours"}
              </button>
            </div>
          </section>
        </form>
      </div>
    </div>
  );
}
