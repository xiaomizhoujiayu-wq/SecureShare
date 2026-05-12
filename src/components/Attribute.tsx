import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Clock,
  CheckCircle,
  Send,
  AlertCircle,
  X,
} from "lucide-react";

interface AvailableAttribute {
  id: string;
  name: string;
  category: string;
  description: string;
}

interface RequestedAttribute {
  id: string;
  name: string;
  category: string;
  status: "pending" | "approved" | "rejected";
  requestedDate: string;
  justification: string;
}

export function AttributeMarketplace() {
  const [selectedAttr, setSelectedAttr] = useState<AvailableAttribute | null>(null);
  const [justification, setJustification] = useState("");
  const [showRequestForm, setShowRequestForm] = useState(false);

  // Available attributes not yet held
  const availableAttributes: AvailableAttribute[] = [
    {
      id: "dept-finance",
      name: "Finance",
      category: "Department",
      description: "Access to financial documents and reports",
    },
    {
      id: "dept-hr",
      name: "HR",
      category: "Department",
      description: "Access to HR-related files and personnel data",
    },
    {
      id: "role-executive",
      name: "Executive",
      category: "Role",
      description: "Executive-level access to strategic documents",
    },
    {
      id: "role-analyst",
      name: "Analyst",
      category: "Role",
      description: "Access to analytical and research materials",
    },
    {
      id: "team-compliance",
      name: "Compliance",
      category: "Team",
      description: "Compliance team access to audit and regulatory files",
    },
  ];

  // Pending and approved requests
  const requestHistory: RequestedAttribute[] = [
    {
      id: "req-1",
      name: "Finance",
      category: "Department",
      status: "pending",
      requestedDate: "2026-04-01",
      justification: "Need access to Q1 financial reports for analysis",
    },
    {
      id: "req-2",
      name: "Executive",
      category: "Role",
      status: "approved",
      requestedDate: "2026-03-28",
      justification: "Promotion to senior management role",
    },
  ];

  const handleRequestAttribute = (attr: AvailableAttribute) => {
    setSelectedAttr(attr);
    setShowRequestForm(true);
    setJustification("");
  };

  const handleSubmitRequest = () => {
    if (!justification.trim()) {
      alert("Please provide a justification for your request");
      return;
    }
    alert(
      `Request submitted for ${selectedAttr?.category}: ${selectedAttr?.name}\n\nJustification: ${justification}\n\nPending admin approval...`
    );
    setShowRequestForm(false);
    setSelectedAttr(null);
    setJustification("");
  };

  return (
    <div className="glass rounded-xl p-4 sm:p-8 border border-slate-700/50">
      <h2 className="font-display text-xl sm:text-2xl mb-6 sm:mb-8">Attribute Self-Service Marketplace</h2>

      <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Available Attributes */}
        <div className="lg:col-span-2">
          <h3 className="font-semibold mb-4 text-base sm:text-lg">Available Attributes</h3>
          <div className="space-y-2 sm:space-y-3">
            {availableAttributes.map((attr) => (
              <div
                key={attr.id}
                className="p-3 sm:p-4 rounded-lg border border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{attr.name}</p>
                    <p className="text-xs text-slate-400">{attr.category}</p>
                  </div>
                  <button
                    onClick={() => handleRequestAttribute(attr)}
                    className="p-2 rounded-lg hover:bg-emerald-500/20 transition-colors text-emerald-400 flex-shrink-0"
                    title="Request attribute"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-slate-400">{attr.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Request History */}
        <div>
          <h3 className="font-semibold mb-4 text-base sm:text-lg">Request History</h3>
          <div className="space-y-2 sm:space-y-3">
            {requestHistory.map((req) => (
              <div
                key={req.id}
                className={`p-3 sm:p-4 rounded-lg border ${
                  req.status === "approved"
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-yellow-500/30 bg-yellow-500/5"
                }`}
              >
                <div className="flex items-start gap-2 mb-2">
                  {req.status === "approved" ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs sm:text-sm">
                      {req.category}: {req.name}
                    </p>
                    <p className={`text-xs font-medium ${
                      req.status === "approved"
                        ? "text-emerald-400"
                        : "text-yellow-400"
                    }`}>
                      {req.status === "approved" ? "Approved" : "Pending"}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mb-1">
                  {req.requestedDate}
                </p>
                <p className="text-xs text-slate-500 italic line-clamp-2">
                  "{req.justification}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Request Form Modal */}
      {showRequestForm && selectedAttr && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="glass rounded-t-xl sm:rounded-xl border border-slate-700/50 max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-display text-lg">Request Attribute</h3>
              <button
                onClick={() => setShowRequestForm(false)}
                className="p-1 hover:bg-slate-700/50 rounded transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 sm:p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <p className="text-xs text-slate-400 mb-1">Requesting:</p>
                <p className="font-semibold text-sm">
                  {selectedAttr.category}: {selectedAttr.name}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  {selectedAttr.description}
                </p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold mb-2">
                  Justification
                </label>
                <textarea
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Explain why you need this attribute..."
                  className="w-full p-2 sm:p-3 rounded-lg bg-slate-900 border border-slate-700/50 text-xs sm:text-sm focus:outline-none focus:border-emerald-500/50 resize-none h-20 sm:h-24"
                />
              </div>

              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-300">
                  Your request will be reviewed by an administrator. Once approved, your private key will be re-keyed.
                </p>
              </div>

              <div className="flex gap-2 sm:gap-3">
                <Button
                  onClick={() => setShowRequestForm(false)}
                  variant="outline"
                  className="flex-1 text-xs sm:text-sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitRequest}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-xs sm:text-sm"
                >
                  <Send className="w-4 h-4 mr-1 sm:mr-2" />
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
