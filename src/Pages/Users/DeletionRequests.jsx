import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  approveAccountDeletionRequest,
  getAccountDeletionRequestById,
  getAccountDeletionRequests,
  rejectAccountDeletionRequest,
} from "../../Api";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Eye,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
  Wallet,
  XCircle,
} from "lucide-react";

const STATUS_OPTIONS = [
  "ALL",
  "PENDING_REVIEW",
  "BLOCKED",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
];

const statusPillClass = (status) => {
  switch (status) {
    case "PENDING_REVIEW":
    case "APPROVED":
      return "bg-blue-100 text-blue-700";
    case "COMPLETED":
      return "bg-green-100 text-green-700";
    case "BLOCKED":
      return "bg-amber-100 text-amber-700";
    case "REJECTED":
      return "bg-red-100 text-red-700";
    case "CANCELLED":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(Number(amount || 0));

export default function DeletionRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewReason, setReviewReason] = useState("");

  const fetchRequests = async () => {
    setLoading(true);
    const params = {};
    if (statusFilter !== "ALL") {
      params.status = statusFilter;
    }
    if (search.trim()) {
      params.search = search.trim();
    }

    const result = await getAccountDeletionRequests(params);
    if (result.ok) {
      setRequests(result.data.requests || []);
    } else {
      toast.error(result.message || "Failed to load deletion requests");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const filteredRequests = useMemo(() => {
    if (!search.trim()) return requests;
    const normalized = search.trim().toLowerCase();
    return requests.filter((request) => {
      const user = request.user || {};
      const snapshot = request.requestSnapshot || {};
      return [user.name, user.email, user.phone, snapshot.name, snapshot.email]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [requests, search]);

  const openDetail = async (requestId) => {
    setDetailLoading(true);
    const result = await getAccountDeletionRequestById(requestId);
    if (result.ok) {
      setSelectedRequest(result.data);
      setReviewNotes("");
      setReviewReason("");
    } else {
      toast.error(result.message || "Failed to load request details");
    }
    setDetailLoading(false);
  };

  const handleApprove = async () => {
    const requestId = selectedRequest?.request?.id;
    if (!requestId) return;

    setActionLoading("approve");
    const result = await approveAccountDeletionRequest(requestId, reviewNotes);
    if (result.ok) {
      toast.success(result.data.message || "Deletion request approved");
      setSelectedRequest(null);
      fetchRequests();
    } else {
      const blockerMessage =
        result.error?.blockers?.[0]?.message || result.message;
      toast.error(blockerMessage || "Unable to approve request");
    }
    setActionLoading("");
  };

  const handleReject = async () => {
    const requestId = selectedRequest?.request?.id;
    if (!requestId) return;
    if (!reviewReason.trim()) {
      toast.error("Please enter a rejection reason");
      return;
    }

    setActionLoading("reject");
    const result = await rejectAccountDeletionRequest(
      requestId,
      reviewReason.trim(),
      reviewNotes.trim(),
    );
    if (result.ok) {
      toast.success(result.data.message || "Deletion request rejected");
      setSelectedRequest(null);
      fetchRequests();
    } else {
      toast.error(result.message || "Unable to reject request");
    }
    setActionLoading("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Account Deletion Requests
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Review deletion requests, verify blockers, and only approve once
              orders, refunds, and wallet conditions are compliant.
            </p>
          </div>
          <button
            onClick={fetchRequests}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, or phone"
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status === "ALL" ? "All statuses" : status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            icon={Trash2}
            label="Visible Requests"
            value={filteredRequests.length}
            tone="slate"
          />
          <MetricCard
            icon={Clock3}
            label="Pending Review"
            value={
              filteredRequests.filter(
                (request) => request.status === "PENDING_REVIEW",
              ).length
            }
            tone="blue"
          />
          <MetricCard
            icon={ShieldAlert}
            label="Blocked"
            value={
              filteredRequests.filter((request) => request.status === "BLOCKED")
                .length
            }
            tone="amber"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Wallet</th>
                  <th className="px-5 py-3">Blockers</th>
                  <th className="px-5 py-3">Requested</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-12 text-center text-gray-500">
                      Loading deletion requests...
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-12 text-center text-gray-500">
                      No deletion requests found
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => {
                    const user = request.user || {};
                    const snapshot = request.requestSnapshot || {};
                    const blockerCount = (request.blockers || []).filter(
                      (item) => item.severity === "BLOCKER",
                    ).length;
                    return (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4">
                          <div className="font-medium text-gray-900">
                            {user.name || snapshot.name || "Unknown user"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.email || snapshot.email || "No email"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.phone || snapshot.phone || "No phone"}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusPillClass(
                              request.status,
                            )}`}
                          >
                            {request.status.replaceAll("_", " ")}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="inline-flex items-center gap-2 text-gray-700">
                            <Wallet className="h-4 w-4 text-green-600" />
                            {formatCurrency(snapshot.walletBalance)}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {blockerCount > 0 ? (
                            <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              {blockerCount} blocker{blockerCount > 1 ? "s" : ""}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Clear
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-gray-600">
                          {formatDate(request.requestedAt)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => openDetail(request.id)}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            <Eye className="h-4 w-4" />
                            Review
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            {detailLoading ? (
              <div className="p-10 text-center text-gray-500">
                Loading request details...
              </div>
            ) : (
              <DeletionRequestDetail
                payload={selectedRequest}
                reviewNotes={reviewNotes}
                setReviewNotes={setReviewNotes}
                reviewReason={reviewReason}
                setReviewReason={setReviewReason}
                actionLoading={actionLoading}
                onApprove={handleApprove}
                onReject={handleReject}
                onClose={() => setSelectedRequest(null)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, tone }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    blue: "bg-blue-100 text-blue-700",
    amber: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`rounded-2xl p-3 ${tones[tone] || tones.slate}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function DeletionRequestDetail({
  payload,
  reviewNotes,
  setReviewNotes,
  reviewReason,
  setReviewReason,
  actionLoading,
  onApprove,
  onReject,
  onClose,
}) {
  const request = payload.request || {};
  const precheck = payload.precheck || {};
  const snapshot = request.requestSnapshot || {};
  const blockers = precheck.blockers || request.blockers || [];
  const warnings = precheck.warnings || request.warnings || [];
  const retainedDataSummary =
    precheck.retainedDataSummary || request.retainedDataSummary || [];
  const canReview =
    request.status === "PENDING_REVIEW" || request.status === "BLOCKED";

  return (
    <div className="p-6 md:p-7">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {request.status?.replaceAll("_", " ") || "UNKNOWN"}
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Account Deletion Review
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Requested on {formatDate(request.requestedAt)}
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Close
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard title="User Snapshot">
          <DetailRow label="Name" value={payload.request?.user?.name || snapshot.name || "—"} />
          <DetailRow label="Email" value={payload.request?.user?.email || snapshot.email || "—"} />
          <DetailRow label="Phone" value={payload.request?.user?.phone || snapshot.phone || "—"} />
          <DetailRow label="Role" value={payload.request?.user?.role || snapshot.role || "—"} />
          <DetailRow label="Wallet Balance" value={formatCurrency(snapshot.walletBalance)} />
        </InfoCard>

        <InfoCard title="Operational Checks">
          <DetailRow label="Active Orders" value={String(snapshot.activeOrdersCount || 0)} />
          <DetailRow label="Pending Returns" value={String(snapshot.pendingReturnsCount || 0)} />
          <DetailRow label="Pending Refund Orders" value={String(snapshot.pendingRefundOrdersCount || 0)} />
          <DetailRow
            label="Wallet Forfeit Accepted"
            value={
              request.userAcknowledgements?.walletForfeitAccepted
                ? "Yes"
                : "No"
            }
          />
        </InfoCard>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <InfoCard title="Blockers">
          {blockers.length === 0 ? (
            <EmptyState icon={CheckCircle2} text="No active blockers" tone="green" />
          ) : (
            blockers.map((item) => (
              <MessageRow key={`${item.code}_${item.message}`} tone="red" text={item.message} />
            ))
          )}
        </InfoCard>

        <InfoCard title="Warnings and Retention">
          {warnings.length === 0 && retainedDataSummary.length === 0 ? (
            <EmptyState icon={CheckCircle2} text="No warnings" tone="green" />
          ) : (
            <>
              {warnings.map((item) => (
                <MessageRow key={`${item.code}_${item.message}`} tone="amber" text={item.message} />
              ))}
              {retainedDataSummary.map((item) => (
                <MessageRow key={item} tone="slate" text={item} />
              ))}
            </>
          )}
        </InfoCard>
      </div>

      <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <h3 className="text-sm font-semibold text-gray-900">Admin review</h3>
        <textarea
          value={reviewNotes}
          onChange={(event) => setReviewNotes(event.target.value)}
          rows={4}
          placeholder="Optional admin notes for audit trail"
          className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none"
        />
        <input
          value={reviewReason}
          onChange={(event) => setReviewReason(event.target.value)}
          placeholder="Required only when rejecting a request"
          className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none"
        />
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onReject}
            disabled={!canReview || actionLoading.length > 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <XCircle className="h-4 w-4" />
            {actionLoading === "reject" ? "Rejecting..." : "Reject Request"}
          </button>
          <button
            onClick={onApprove}
            disabled={!canReview || actionLoading.length > 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            {actionLoading === "approve" ? "Approving..." : "Approve and Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-gray-900">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-900">{value}</span>
    </div>
  );
}

function MessageRow({ tone, text }) {
  const tones = {
    red: "border-red-200 bg-red-50 text-red-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    slate: "border-slate-200 bg-slate-50 text-slate-700",
  };

  return (
    <div className={`rounded-xl border px-3 py-2 text-sm ${tones[tone] || tones.slate}`}>
      {text}
    </div>
  );
}

function EmptyState({ icon: Icon, text, tone }) {
  const tones = {
    green: "bg-green-100 text-green-700",
  };

  return (
    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium ${tones[tone] || tones.green}`}>
      <Icon className="h-4 w-4" />
      {text}
    </div>
  );
}
