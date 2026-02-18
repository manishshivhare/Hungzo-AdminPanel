import React from "react";

const DeliveryFeeRules = () => {
  return (
    <div className="space-y-2">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-100 rounded-xl">
          <svg
            className="w-6 h-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-800">
            Delivery Fee Rules
          </h2>
          <p className="text-sm text-slate-500">
            Read-only view of how delivery charges are calculated
          </p>
        </div>
      </div>

      {/* RULE CARDS */}
      <div className="grid gap-2">
        {/* BASE FEE */}
        <RuleCard
          title="Base Delivery Fee"
          description="Applied to every order irrespective of distance"
          value="₹30"
          color="blue"
        />

        {/* DISTANCE */}
        <RuleCard
          title="Distance-based Pricing"
          description="Extra charge after first 3 km"
          value="+ ₹10 / km"
          color="slate"
        />

        {/* PEAK */}
        <RuleCard
          title="Peak Hour Surcharge"
          description="Applied during high-demand hours (7 PM – 10 PM)"
          value="+ ₹25"
          color="amber"
        />

        {/* FREE DELIVERY */}
        <RuleCard
          title="Free Delivery Threshold"
          description="Orders above this amount get free delivery"
          value="₹499+"
          color="green"
        />
      </div>

      {/* SUMMARY */}
      <div className="bg-slate-50 border rounded-xl p-3">
        <h4 className="font-semibold text-slate-800 mb-2">
          Fee Calculation Summary
        </h4>

        <p className="text-sm text-slate-600 leading-relaxed">
          Delivery fee is automatically calculated as:
          <br />
          <b>Base Fee</b> + <b>Distance Charges</b> +{" "}
          <b>Peak Hour Surcharge (if applicable)</b>.
          <br />
          Orders with a cart value of <b>₹499 or more</b> qualify for{" "}
          <b>free delivery</b>.
        </p>

        <span className="inline-block mt-3 text-xs px-3 py-1 rounded-full bg-slate-200 text-slate-600">
          System Applied • Not Editable
        </span>
      </div>
    </div>
  );
};

/* ---------- REUSABLE CARD ---------- */
const RuleCard = ({ title, description, value, color }) => {
  const colorMap = {
    blue: "from-blue-50 to-indigo-50 border-blue-100 text-blue-600",
    slate: "from-slate-50 to-slate-100 border-slate-200 text-slate-800",
    amber: "from-amber-50 to-orange-50 border-amber-100 text-amber-600",
    green: "from-green-50 to-emerald-50 border-green-100 text-green-600",
  };

  return (
    <div
      className={`bg-gradient-to-r ${colorMap[color]} border rounded-xl p-5`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <p className="text-sm text-slate-600 mt-1">{description}</p>
        </div>

        <div className="text-lg font-bold">{value}</div>
      </div>
    </div>
  );
};

export default DeliveryFeeRules;
