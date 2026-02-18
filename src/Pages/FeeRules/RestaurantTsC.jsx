import React, { useState } from "react";

const RestaurantTsC = () => {
  const [rules, setRules] = useState([
    {
      id: 1,
      title: "Menu Pricing Accuracy",
      description: "Restaurant must maintain updated menu pricing",
      status: "active",
      priority: "high",
      lastUpdated: "2024-03-15",
      icon: "💰",
      penalty: "$50 penalty per violation"
    },
    {
      id: 2,
      title: "Order Preparation Time",
      description: "Preparation time estimates must be accurate (±5 minutes)",
      status: "active",
      priority: "high",
      lastUpdated: "2024-03-10",
      icon: "⏱️",
      penalty: "Reduced ranking for repeated delays"
    },
    {
      id: 3,
      title: "Cancellation Policy",
      description: "Cancellation after acceptance may attract penalty",
      status: "active",
      priority: "medium",
      lastUpdated: "2024-03-05",
      icon: "🚫",
      penalty: "10% of order value or $20, whichever is higher"
    },
    {
      id: 4,
      title: "Food Quality Compliance",
      description: "Food quality must meet platform standards",
      status: "active",
      priority: "critical",
      lastUpdated: "2024-03-01",
      icon: "⭐",
      penalty: "Suspension after 3 violations"
    },
    {
      id: 5,
      title: "Order Accuracy",
      description: "Orders must match exactly what customer ordered",
      status: "active",
      priority: "high",
      lastUpdated: "2024-02-28",
      icon: "✅",
      penalty: "Full refund + $10 credit to customer"
    },
    {
      id: 6,
      title: "Hygiene Standards",
      description: "Maintain highest hygiene and safety standards",
      status: "active",
      priority: "critical",
      lastUpdated: "2024-02-25",
      icon: "🧼",
      penalty: "Immediate suspension until compliance"
    }
  ]);

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-2 min-h-screen ">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Restaurant Terms & Compliance</h2>
          <p className="text-sm text-slate-500 mt-1">Rules and regulations for restaurant partners</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Last updated: Today</span>
          {/* <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Add New Rule
          </button> */}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rules.map((rule) => (
          <div 
            key={rule.id} 
            className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-200 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-3xl">{rule.icon}</div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(rule.priority)}`}>
                {rule.priority.charAt(0).toUpperCase() + rule.priority.slice(1)}
              </span>
            </div>
            
            <h3 className="font-semibold text-slate-800 mb-2">{rule.title}</h3>
            <p className="text-sm text-slate-600 mb-4">{rule.description}</p>
            
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Penalty</p>
                  <p className="text-sm font-medium text-slate-700">{rule.penalty}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Updated</p>
                  <p className="text-sm font-medium text-slate-700">{rule.lastUpdated}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r-from-slate-50 to-slate-100 rounded-xl p-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-slate-800">Important Notes</h4>
            <p className="text-sm text-slate-600 mt-1">
              Violations may result in penalties, reduced visibility, or account suspension. 
              Restaurant partners are responsible for staying updated with rule changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantTsC;