import { useState, useEffect, useCallback } from "react";
import { 
  Users, X, Check, AlertCircle, Loader2, Edit2, Plus, Tag
} from "lucide-react";

interface User {
  id: number;
  username: string;
  email: string;
  attributes: string;
}

interface Attribute {
  id?: number;
  name: string;
  description?: string;
}

const baseUrl = "http://localhost:8080/abe";

export function SubAdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [catalog, setCatalog] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newAttributes, setNewAttributes] = useState("");
  const [newCatalogAttr, setNewCatalogAttr] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const token = localStorage.getItem("auth_token");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/admin/users`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load users. Are you sub-admin?";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchCatalog = useCallback(async () => {
    try {
      const res = await fetch(`${baseUrl}/attributes`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch catalog");
      const data = await res.json();
      setCatalog(data.map((item: Attribute) => item.name));
    } catch (err) {
      console.error("Failed to fetch catalog:", err);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      window.location.href = "/signin";
      return;
    }
    fetchUsers();
    fetchCatalog();
  }, [fetchUsers, fetchCatalog, token]);

  const addToCatalog = async () => {
    if (!newCatalogAttr.trim()) {
      setError("Please enter an attribute name");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/admin/attributes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newCatalogAttr.trim(),
          description: "Added via Sub-Admin Panel"
        })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add attribute");
      }
      setSuccess(`Attribute "${newCatalogAttr}" added successfully!`);
      setNewCatalogAttr("");
      await fetchCatalog();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAssignModal = (user: User) => {
    setSelectedUser(user);
    const allAttrs = user.attributes ? user.attributes.split(",") : [];
    const displayAttrs = allAttrs.filter(attr => !attr.trim().startsWith("ID:"));
    setNewAttributes(displayAttrs.join(","));
    setShowModal(true);
    setError(null);
  };

  const submitAssignment = async () => {
    if (!selectedUser || !newAttributes.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const finalAttrList = newAttributes.split(",").map(a => a.trim()).filter(a => a && !a.startsWith("ID:"));
      const payload = { 
        targetUserId: parseInt(selectedUser.id.toString()), 
        attributes: finalAttrList.join(",") 
      };
      const res = await fetch(`${baseUrl}/admin/assign-attributes`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to update attributes");
      }
      setSuccess("Attributes updated successfully!");
      setShowModal(false);
      setNewAttributes("");
      setSelectedUser(null);
      await fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const parseAttributes = (attrString: string | undefined): string[] => {
    if (!attrString) return [];
    return attrString.split(",").map(a => a.trim()).filter(a => a && !a.startsWith("ID:"));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 sm:p-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-display text-3xl text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            User Management
          </h1>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-500/20 border border-red-200 dark:border-red-500/50 flex items-center gap-3 transition-colors">
            <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"><X className="w-4 h-4" /></button>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/50 flex items-center gap-3 transition-colors">
            <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm text-emerald-700 dark:text-emerald-300">{success}</p>
          </div>
        )}

        {/* Attribute Catalog */}
        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-xl border border-slate-200 dark:border-slate-700/50 p-6 mb-8 shadow-sm dark:shadow-xl transition-colors duration-300">
          <h2 className="text-xl font-display text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
            <Tag className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Attribute Catalog
          </h2>

          <div className="space-y-5">
            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 p-5 rounded-xl transition-colors">
              <label className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-3 block">
                Create New Attribute
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newCatalogAttr}
                  onChange={(e) => setNewCatalogAttr(e.target.value)}
                  placeholder="e.g., Dep:IT, Role:staff"
                  className="flex-1 px-4 py-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-lg text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 dark:focus:ring-emerald-500/50 transition-all"
                  disabled={isSubmitting}
                />
                <button
                  onClick={addToCatalog}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add to Catalog
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50 p-5 rounded-xl transition-colors">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 block">Active Attributes List</label>
              <div className="flex flex-wrap gap-2.5 max-h-64 overflow-y-auto pr-2">
                {catalog.length > 0 ? catalog.map((attr) => (
                  <span key={attr} className="px-4 py-2 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" /> {attr}
                  </span>
                )) : (
                  <span className="text-slate-500 dark:text-slate-500 text-xs italic">No attributes in catalog yet</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-sm dark:shadow-xl transition-colors duration-300">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-500" />
              <p className="text-sm">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-700/50 transition-colors">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">ID</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">User Info</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 w-[420px]">Attributes</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                        <AlertCircle className="w-6 h-6 mx-auto mb-2 opacity-50" />
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user, index) => (
                      <tr key={user.id} className="border-b border-slate-200 dark:border-slate-700/30 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">#{index + 1}</td>
                        <td className="px-6 py-4" >
                          <div className="font-bold text-slate-900 dark:text-slate-200">{user.username}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 w-[420px]">
                          <div className="flex flex-wrap gap-1.5 items-center max-w-[400px]">
                            {parseAttributes(user.attributes).length > 0 ? (
                              parseAttributes(user.attributes).map((attr) => (
                                <span key={attr} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400 text-xs font-medium transition-colors">
                                  {attr}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-500 dark:text-slate-500 text-xs italic">No attributes</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => openAssignModal(user)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 hover:text-emerald-700 dark:bg-emerald-600/20 dark:border-emerald-500/50 dark:text-emerald-400 dark:hover:bg-emerald-600/40 transition-all text-sm font-semibold"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Assign
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-colors">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-xl dark:shadow-2xl w-full max-w-md overflow-hidden transition-colors">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center transition-colors">
              <h3 className="font-display text-lg text-slate-900 dark:text-slate-100">
                Assign Attributes for{" "}
                <span className="text-emerald-600 dark:text-emerald-400">{selectedUser.username}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/20 border border-red-200 dark:border-red-500/50 flex items-center gap-2 transition-colors">
                  <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
                  <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block">
                  Attributes
                </label>
                <input
                  type="text"
                  value={newAttributes}
                  onChange={(e) => setNewAttributes(e.target.value)}
                  placeholder="e.g., Dept:Finance, Role:Manager"
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-lg text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 dark:focus:ring-emerald-500/50 disabled:opacity-50 transition-all"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/20 flex gap-3 transition-colors">
              <button
                onClick={() => setShowModal(false)}
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 rounded-lg border border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600/50 transition-all text-sm font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={submitAssignment}
                disabled={isSubmitting || !newAttributes.trim()}
                className="flex-1 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Update Attributes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
