import { Shield, CheckCircle, AlertCircle, Copy,Loader2 } from "lucide-react";
import { useState,useEffect} from "react";
import { getMyAttributes } from "@/lib/api";

interface Attribute {
  category: string;
  value: string;
  color: string;
}

// color interface
const COLOR_THEMES = [
  "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "bg-rose-500/20 text-rose-300 border-rose-500/30",
];

export function IdentityStatus() {
  const [copied, setCopied] = useState(false);
  
  //
  const [loading, setLoading] = useState(true);
  const [userUID, setUserUID] = useState("Loading...");
  const [attributes, setAttributes] = useState<Attribute[]>([]);

useEffect(() => {
    const fetchIdentity = async () => {
      try {
        const data = await getMyAttributes();
        
        const rawAttrString = data.attributes || ""; 
        const attrArray = rawAttrString.trim() ? rawAttrString.split(',') : [];

        // 
        const idAttribute = attrArray.find((attr: string) => attr.startsWith("ID:"));
        
        if (idAttribute) {
          // find uuid
          setUserUID(idAttribute.substring(3)); 
        } else {
          // 
          setUserUID(`ABE-USR-${data.userId}`);
        }

        // 2. find attribute
        const businessAttributes = attrArray.filter((attr: string) => !attr.startsWith("ID:"));

        // 3. 
        const parsedAttributes = businessAttributes.map((attrStr: string, index: number) => {
          const parts = attrStr.split(':');
          const category = parts.length > 1 ? parts[0] : "Tag";
          //
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
    <div className="glass rounded-xl p-4 sm:p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-lg sm:text-xl">Identity & Key Status</h2>
        {loading && <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />}
      </div>

      <div className="space-y-6">
        {/* User UID Section */}
        <div>
          <p className="text-xs text-slate-400 mb-3 font-semibold">Your Unique Identifier (UID)</p>
          <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 overflow-hidden">
            <code className="text-xs sm:text-sm font-mono text-cyan-400 flex-1 truncate">
              {userUID}
            </code>
            <button
              onClick={handleCopyUID}
              disabled={loading}
              className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-slate-200 flex-shrink-0 disabled:opacity-50"
              title="Copy UID"
            >
              <Copy className="w-4 h-4" />
            </button>
            {copied && (<span className="text-green-400 text-xs">Copied!</span>)}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Used for direct one-to-one file sharing
          </p>
        </div>

        {/* Active Attributes Section */}
        <div>
          <p className="text-xs text-slate-400 mb-3 font-semibold">Active Attributes</p>
          
          {loading ? (
            <div className="animate-pulse flex gap-2">
              <div className="h-8 w-20 bg-slate-700/50 rounded-full"></div>
              <div className="h-8 w-24 bg-slate-700/50 rounded-full"></div>
            </div>
          ) : attributes.length === 0 ? (
            <div className="p-4 border border-dashed border-slate-700 rounded-lg text-center">
              <p className="text-sm text-slate-500">No attributes assigned yet.</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {attributes.map((attr, idx) => (
                <div
                  key={idx}
                  className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full border text-xs sm:text-sm ${attr.color}`}
                >
                  <span className="font-medium hidden sm:inline">{attr.category}:</span>
                  <span className="font-semibold">{attr.value}</span>
                </div>
              ))}
            </div>
          )}
          
          <p className="text-xs text-slate-400 mt-2">
            These attributes define your access permissions in policy-based sharing
          </p>
        </div>

        {/* Key Health Status */}
        <div>
          <p className="text-xs text-slate-400 mb-3 font-semibold">Key Health</p>
          <div className="flex items-center gap-3 p-3 sm:p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-emerald-300">Private Key Synced</p>
              <p className="text-xs text-emerald-300/70">
                CP-ABE secret key successfully generated and synced
              </p>
            </div>
          </div>
        </div>

        {/* Security Info */}
        <div className="p-3 sm:p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
          <div className="flex items-start gap-2 sm:gap-3">
            <Shield className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-400">
              Your cryptographic identity is securely managed. All file access is verified against your attributes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}