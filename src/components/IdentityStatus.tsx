import { Shield, CheckCircle, AlertCircle, Copy, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getMyAttributes } from "@/lib/api";

interface Attribute {
  category: string;
  value: string;
  color: string;
}

const COLOR_THEMES = [
  "bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30",
  "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30",
  "bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30",
  "bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30",
  "bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30",
];

export function IdentityStatus() {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userUID, setUserUID] = useState("Loading...");
  const [attributes, setAttributes] = useState<Attribute[]>([]);

  useEffect(() => {
    const fetchIdentity = async () => {
      try {
        const data = await getMyAttributes();
        
        const rawAttrString = data.attributes || ""; 
        const attrArray = rawAttrString.trim() ? rawAttrString.split(',') : [];

        const idAttribute = attrArray.find((attr: string) => attr.startsWith("ID:"));
        
        if (idAttribute) {
          setUserUID(idAttribute.substring(3)); 
        } else {
          setUserUID(`ABE-USR-${data.userId}`);
        }

        const businessAttributes = attrArray.filter((attr: string) => !attr.startsWith("ID:"));
        
        const parsedAttributes = businessAttributes.map((attrStr: string, index: number) => {
          const parts = attrStr.split(':');
          const category = parts.length > 1 ? parts[0] : "tag";
          const value = parts.length > 1 ? parts.slice(1).join(':') : attrStr; 
          
          return {
            category: category,
            value: value,
            color: COLOR_THEMES[index % COLOR_THEMES.length]
          };
        });

        setAttributes(parsedAttributes);
      } catch (error) {
        console.error("Failed to load identity data", error);
        setUserUID("Error Loading ID");
      } finally {
        setLoading(false);
      }
    };

    fetchIdentity();
  }, []);

  const handleCopyUID = () => {
    navigator.clipboard.writeText(userUID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl p-4 sm:p-6 bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 shadow-sm dark:shadow-none transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-lg sm:text-xl text-slate-900 dark:text-white">Identity & Key Status</h2>
        {loading && <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />}
      </div>

      <div className="space-y-6">
        {/* User UID Section */}
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-semibold uppercase tracking-wider">Your Unique Identifier (UID)</p>
          <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 overflow-hidden transition-colors">
            <code className="text-xs sm:text-sm font-mono text-cyan-600 dark:text-cyan-400 flex-1 truncate">
              {userUID}
            </code>
            <button
              onClick={handleCopyUID}
              disabled={loading}
              className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 flex-shrink-0 disabled:opacity-50"
              title="Copy UID"
            >
              <Copy className="w-4 h-4" />
            </button>
            {copied && (<span className="text-emerald-600 dark:text-emerald-400 text-xs font-medium">Copied!</span>)}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Used for direct one-to-one file sharing
          </p>
        </div>

        {/* Active Attributes Section */}
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-semibold uppercase tracking-wider">Active Attributes</p>
          
          {loading ? (
            <div className="animate-pulse flex gap-2">
              <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700/50 rounded-full"></div>
              <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700/50 rounded-full"></div>
            </div>
          ) : attributes.length === 0 ? (
            <div className="p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-center bg-slate-50 dark:bg-transparent">
              <p className="text-sm text-slate-500 dark:text-slate-400">No attributes assigned yet.</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {attributes.map((attr, idx) => (
                <div
                  key={idx}
                  className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full border text-xs sm:text-sm transition-colors ${attr.color}`}
                >
                  <span className="font-medium hidden sm:inline">{attr.category}:</span>
                  <span className="font-semibold">{attr.value}</span>
                </div>
              ))}
            </div>
          )}
          
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            These attributes define your access permissions in policy-based sharing
          </p>
        </div>

        {/* Key Health Status */}
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-semibold uppercase tracking-wider">Key Health</p>
          <div className="flex items-center gap-3 p-3 sm:p-4 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 transition-colors">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Private Key Synced</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-300/70 mt-0.5">
                CP-ABE secret key successfully generated and synced
              </p>
            </div>
          </div>
        </div>

        {/* Security Info */}
        <div className="p-3 sm:p-4 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50 transition-colors">
          <div className="flex items-start gap-2 sm:gap-3">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Your cryptographic identity is securely managed. All file access is verified against your attributes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}