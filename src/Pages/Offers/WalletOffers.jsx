import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  createWalletOffer,
  deleteWalletOffer,
  getWalletOffers,
  toggleWalletOffer,
  updateWalletOffer,
} from "../../Api";
import { Gift, Plus, Power, Trash2, Pencil } from "lucide-react";

const initialForm = {
  title: "",
  description: "",
  badge: "",
  bonusType: "PERCENTAGE",
  bonusValue: "",
  minTopupAmount: "",
  maxTopupAmount: "",
  maxBonusAmount: "",
  usageLimitPerUser: "",
  priority: "0",
  isActive: true,
};

export default function WalletOffers() {
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);

  const activeCount = useMemo(
    () => offers.filter((offer) => offer.isActive).length,
    [offers]
  );

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    setIsLoading(true);
    const res = await getWalletOffers();
    if (res.success) {
      setOffers(res.offers || []);
    } else {
      toast.error(res.message || "Failed to fetch wallet offers");
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      ...form,
      bonusValue: Number(form.bonusValue || 0),
      minTopupAmount: Number(form.minTopupAmount || 0),
      maxTopupAmount: form.maxTopupAmount === "" ? null : Number(form.maxTopupAmount),
      maxBonusAmount: form.maxBonusAmount === "" ? null : Number(form.maxBonusAmount),
      usageLimitPerUser:
        form.usageLimitPerUser === "" ? null : Number(form.usageLimitPerUser),
      priority: Number(form.priority || 0),
      isActive: Boolean(form.isActive),
    };

    const res = editingId
      ? await updateWalletOffer(editingId, payload)
      : await createWalletOffer(payload);

    setIsSaving(false);

    if (!res.success) {
      toast.error(res.message || "Unable to save wallet offer");
      return;
    }

    toast.success(res.message || "Wallet offer saved");
    setForm(initialForm);
    setEditingId(null);
    loadOffers();
  };

  const handleEdit = (offer) => {
    setEditingId(offer.id);
    setForm({
      title: offer.title || "",
      description: offer.description || "",
      badge: offer.badge || "",
      bonusType: offer.bonusType || "PERCENTAGE",
      bonusValue: String(offer.bonusValue ?? ""),
      minTopupAmount: String(offer.minTopupAmount ?? ""),
      maxTopupAmount:
        offer.maxTopupAmount === null || offer.maxTopupAmount === undefined
          ? ""
          : String(offer.maxTopupAmount),
      maxBonusAmount:
        offer.maxBonusAmount === null || offer.maxBonusAmount === undefined
          ? ""
          : String(offer.maxBonusAmount),
      usageLimitPerUser:
        offer.usageLimitPerUser === null || offer.usageLimitPerUser === undefined
          ? ""
          : String(offer.usageLimitPerUser),
      priority: String(offer.priority ?? 0),
      isActive: Boolean(offer.isActive),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggle = async (offer) => {
    const res = await toggleWalletOffer(offer.id);
    if (!res.success) {
      toast.error(res.message || "Failed to update offer");
      return;
    }
    toast.success(res.message || "Offer updated");
    loadOffers();
  };

  const handleDelete = async (offer) => {
    const confirmed = window.confirm(`Delete "${offer.title}"?`);
    if (!confirmed) {
      return;
    }

    const res = await deleteWalletOffer(offer.id);
    if (!res.success) {
      toast.error(res.message || "Failed to delete offer");
      return;
    }
    toast.success(res.message || "Offer deleted");
    loadOffers();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Wallet Offers</h1>
                  <p className="text-gray-600 mt-1">
                    Configure top-up bonus offers for the user wallet experience.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="rounded-2xl bg-emerald-50 px-4 py-3 border border-emerald-100">
                <p className="text-xs text-emerald-700 font-semibold">Active Offers</p>
                <p className="text-2xl font-bold text-emerald-800">{activeCount}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 border border-slate-200">
                <p className="text-xs text-slate-600 font-semibold">Total Offers</p>
                <p className="text-2xl font-bold text-slate-900">{offers.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[420px_minmax(0,1fr)] gap-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? "Edit Wallet Offer" : "Create Wallet Offer"}
              </h2>
              {editingId && (
                <button
                  onClick={() => {
                    setEditingId(null);
                    setForm(initialForm);
                  }}
                  className="text-sm font-semibold text-gray-500 hover:text-gray-900"
                >
                  Cancel edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-400"
                placeholder="Offer title"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                required
              />
              <textarea
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-400 min-h-[96px]"
                placeholder="Offer description"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />
              <input
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-400"
                placeholder="Badge text (optional)"
                value={form.badge}
                onChange={(e) => setForm((prev) => ({ ...prev, badge: e.target.value }))}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-400"
                  value={form.bonusType}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, bonusType: e.target.value }))
                  }
                >
                  <option value="PERCENTAGE">Percentage Bonus</option>
                  <option value="FLAT">Flat Bonus</option>
                </select>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-400"
                  placeholder="Bonus value"
                  value={form.bonusValue}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, bonusValue: e.target.value }))
                  }
                  required
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-400"
                  placeholder="Min top-up amount"
                  value={form.minTopupAmount}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, minTopupAmount: e.target.value }))
                  }
                  required
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-400"
                  placeholder="Max top-up amount (optional)"
                  value={form.maxTopupAmount}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, maxTopupAmount: e.target.value }))
                  }
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-400"
                  placeholder="Max bonus amount (optional)"
                  value={form.maxBonusAmount}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, maxBonusAmount: e.target.value }))
                  }
                />
                <input
                  type="number"
                  min="1"
                  step="1"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-400"
                  placeholder="Usage frequency per user (optional)"
                  value={form.usageLimitPerUser}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, usageLimitPerUser: e.target.value }))
                  }
                />
                <input
                  type="number"
                  step="1"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-400"
                  placeholder="Priority"
                  value={form.priority}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, priority: e.target.value }))
                  }
                />
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                />
                <span className="text-sm font-medium text-gray-700">
                  Offer enabled for users
                </span>
              </label>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-white font-semibold py-3 hover:bg-emerald-700 disabled:opacity-60"
              >
                <Plus size={18} />
                {isSaving
                  ? "Saving..."
                  : editingId
                    ? "Update Wallet Offer"
                    : "Create Wallet Offer"}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">Configured Offers</h2>
              <button
                onClick={loadOffers}
                className="text-sm font-semibold text-emerald-700 hover:text-emerald-900"
              >
                Refresh
              </button>
            </div>

            {isLoading ? (
              <div className="py-16 text-center text-gray-500">Loading wallet offers...</div>
            ) : offers.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                No wallet offers configured yet.
              </div>
            ) : (
              <div className="space-y-4">
                {offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="rounded-3xl border border-gray-200 p-5 bg-gray-50"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold text-gray-900">{offer.title}</h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              offer.isActive
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {offer.isActive ? "ACTIVE" : "DISABLED"}
                          </span>
                          {offer.badge && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                              {offer.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{offer.description || "No description added."}</p>
                        <div className="flex flex-wrap gap-2">
                          <OfferPill label={`Type: ${offer.bonusType}`} />
                          <OfferPill label={`Bonus: ${offer.bonusValue}`} />
                          <OfferPill label={`Min top-up: ₹${offer.minTopupAmount}`} />
                          {offer.maxTopupAmount !== null && (
                            <OfferPill label={`Max top-up: ₹${offer.maxTopupAmount}`} />
                          )}
                          {offer.maxBonusAmount !== null && (
                            <OfferPill label={`Bonus cap: ₹${offer.maxBonusAmount}`} />
                          )}
                          {offer.usageLimitPerUser !== null && (
                            <OfferPill label={`Frequency: ${offer.usageLimitPerUser}/user`} />
                          )}
                          <OfferPill label={`Priority: ${offer.priority}`} />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleEdit(offer)}
                          className="inline-flex items-center gap-2 rounded-2xl bg-white border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                        >
                          <Pencil size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggle(offer)}
                          className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold ${
                            offer.isActive
                              ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                              : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          }`}
                        >
                          <Power size={16} />
                          {offer.isActive ? "Disable" : "Enable"}
                        </button>
                        <button
                          onClick={() => handleDelete(offer)}
                          className="inline-flex items-center gap-2 rounded-2xl bg-red-100 text-red-700 px-4 py-2 text-sm font-semibold hover:bg-red-200"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function OfferPill({ label }) {
  return (
    <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-gray-200 text-gray-700">
      {label}
    </span>
  );
}
