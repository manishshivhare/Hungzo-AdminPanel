import React from "react";

const CommissionsTsC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Commission Rules</h2>

      <ul className="list-disc pl-5 text-sm text-slate-600 space-y-2">
        <li>Platform commission is charged on every completed order.</li>
        <li>Standard commission rate: <b>15%</b>.</li>
        <li>Commission is deducted before payout.</li>
        <li>Taxes may apply as per government rules.</li>
      </ul>
    </div>
  );
};

export default CommissionsTsC;
