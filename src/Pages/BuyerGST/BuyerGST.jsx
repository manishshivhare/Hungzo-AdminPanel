import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  approveBuyerGstRequest,
  getBuyerGstRequests,
  getStoreSettings,
  rejectBuyerGstRequest,
  updateStoreSettings,
} from "../../Api";

const statusPillClass = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-rose-100 text-rose-800",
  NONE: "bg-slate-100 text-slate-700",
};

export default function BuyerGST() {
  const [loading, setLoading] = useState(true);
  const [savingToggle, setSavingToggle] = useState(false);
  const [actingUserId, setActingUserId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [autoVerifyEnabled, setAutoVerifyEnabled] = useState(false);
  const [settingsPayload, setSettingsPayload] = useState(null);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
    setLoading(true);
    const [settingsResponse, requestsResponse] = await Promise.all([
      getStoreSettings(),
      getBuyerGstRequests(),
    ]);

    if (settingsResponse?.success) {
      const legalDetails = settingsResponse.settings?.legalDetails || {};
      setAutoVerifyEnabled(legalDetails.gstVerification?.enabled === true);
      setSettingsPayload(legalDetails);
    } else {
      toast.error(settingsResponse?.message || "Failed to load GST settings");
    }

    if (requestsResponse?.success) {
      setRequests(requestsResponse.users || []);
    } else {
      toast.error(requestsResponse?.message || "Failed to load buyer GST requests");
    }

    setLoading(false);
  }

  async function handleToggle(nextValue) {
    if (!settingsPayload) return;
    setSavingToggle(true);
    const response = await updateStoreSettings({
      legalDetails: {
        ...settingsPayload,
        gstVerification: {
          enabled: nextValue,
          provider: "cashfree",
        },
      },
    });

    if (!response?.success) {
      toast.error(response?.message || "Failed to update GST verification mode");
      setSavingToggle(false);
      return;
    }

    const legalDetails = response.settings?.legalDetails || settingsPayload;
    setSettingsPayload(legalDetails);
    setAutoVerifyEnabled(legalDetails.gstVerification?.enabled === true);
    toast.success(
      nextValue
        ? "Auto GST verification enabled"
        : "Manual GST approval flow enabled"
    );
    setSavingToggle(false);
  }

  async function handleApprove(userId) {
    setActingUserId(userId);
    const response = await approveBuyerGstRequest(userId);
    if (!response?.success) {
      toast.error(response?.message || "Failed to approve request");
      setActingUserId("");
      return;
    }
    setRequests((current) =>
      current.map((entry) => (entry._id === userId ? response.user : entry))
    );
    toast.success("Buyer GST approved");
    setActingUserId("");
  }

  async function handleReject(userId) {
    const reason = window.prompt("Reason for rejection (optional)") || "";
    setActingUserId(userId);
    const response = await rejectBuyerGstRequest(userId, reason);
    if (!response?.success) {
      toast.error(response?.message || "Failed to reject request");
      setActingUserId("");
      return;
    }
    setRequests((current) =>
      current.map((entry) => (entry._id === userId ? response.user : entry))
    );
    toast.success("Buyer GST rejected");
    setActingUserId("");
  }

  const filteredRequests = useMemo(() => {
    return requests.filter((entry) => {
      const details = entry.gstDetails || {};
      const status = details.approvalStatus || "NONE";
      const matchesStatus =
        selectedStatus === "ALL" ? true : status === selectedStatus;
      const haystack = [
        entry.name,
        entry.email,
        entry.phone,
        details.gstNumber,
        details.legalName,
        details.tradeName,
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch = haystack.includes(searchTerm.trim().toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [requests, searchTerm, selectedStatus]);

  const stats = useMemo(() => {
    return requests.reduce(
      (summary, entry) => {
        const status = entry.gstDetails?.approvalStatus || "NONE";
        summary.total += 1;
        if (status === "PENDING") summary.pending += 1;
        if (status === "APPROVED") summary.approved += 1;
        if (status === "REJECTED") summary.rejected += 1;
        return summary;
      },
      { total: 0, pending: 0, approved: 0, rejected: 0 }
    );
  }, [requests]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-900 p-6 text-white shadow-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">
                Users
              </p>
              <h1 className="mt-2 text-3xl font-semibold">Buyer GST</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-200">
                Review buyer GST requests, approve manual submissions, or switch to automatic Cashfree verification.
              </p>
            </div>

            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-4">
              <p className="text-sm font-semibold text-white">
                Verification mode
              </p>
              <p className="mt-1 text-sm text-slate-200">
                {autoVerifyEnabled
                  ? "Auto verify with Cashfree is enabled for users."
                  : "Users submit GST details for admin approval."}
              </p>
              <label className="mt-4 flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={autoVerifyEnabled}
                  onChange={(event) => handleToggle(event.target.checked)}
                  disabled={savingToggle || loading}
                  className="h-4 w-4 rounded border-white/30"
                />
                Auto verify using Cashfree
              </label>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          {[
            ["Total requests", stats.total],
            ["Pending review", stats.pending],
            ["Approved", stats.approved],
            ["Rejected", stats.rejected],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by user, GSTIN, legal name, or phone"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            />
            <select
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            >
              <option value="ALL">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">GST Details</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3">Last review</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {!loading && filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center text-slate-500">
                      No buyer GST requests found
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((entry) => {
                    const details = entry.gstDetails || {};
                    const status = details.approvalStatus || "NONE";
                    const isPending = status === "PENDING";
                    return (
                      <tr key={entry._id} className="align-top">
                        <td className="px-4 py-4">
                          <div className="font-semibold text-slate-900">
                            {entry.name || "—"}
                          </div>
                          <div className="text-slate-500">{entry.email || "—"}</div>
                          <div className="text-slate-500">{entry.phone || "—"}</div>
                        </td>
                        <td className="px-4 py-4 text-slate-700">
                          <div className="font-semibold">{details.gstNumber || "—"}</div>
                          <div>{details.legalName || "—"}</div>
                          {details.tradeName ? (
                            <div className="text-slate-500">{details.tradeName}</div>
                          ) : null}
                          <div className="mt-1 text-slate-500">
                            {[
                              details.addressLine1,
                              details.addressLine2,
                              details.city,
                              details.state,
                              details.pincode,
                            ]
                              .filter(Boolean)
                              .join(", ") || "—"}
                          </div>
                          {details.rejectionReason ? (
                            <div className="mt-2 text-rose-600">
                              Rejection reason: {details.rejectionReason}
                            </div>
                          ) : null}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              statusPillClass[status] || statusPillClass.NONE
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          <div>{details.verificationMode || "—"}</div>
                          <div className="text-xs text-slate-500">
                            {details.isVerified ? "Cashfree verified" : "Admin review flow"}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {details.reviewedAt
                            ? new Date(details.reviewedAt).toLocaleString("en-IN")
                            : "Not reviewed"}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              disabled={!isPending || actingUserId === entry._id}
                              onClick={() => handleApprove(entry._id)}
                              className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              disabled={!isPending || actingUserId === entry._id}
                              onClick={() => handleReject(entry._id)}
                              className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 disabled:cursor-not-allowed disabled:text-slate-400"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
