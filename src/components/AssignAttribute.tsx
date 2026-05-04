import { useState, useEffect } from "react";
import { 
  Plus, ShieldCheck, Users, Tag, X, Check, AlertCircle, Loader2, 
  Edit2, Trash2, ChevronDown, Search, Filter, ShieldPlus
} from "lucide-react";


interface User {
  id: number;
  username: string;
  email: string;
  attributes: string;
  role?: string; // ADMIN, SUB_ADMIN, USER
}

interface Attribute {
  id?: number;
  name: string;
  description?: string;
}

export function AdminPanel() {

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
  

  // filter and query
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("ALL"); // ALL, SUB_ADMIN, USER

  // new subadmin
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newSubAdmin, setNewSubAdmin] = useState({ username: "", email: "", password: "" });

  const baseUrl = "http://localhost:8080/abe";
  const token = localStorage.getItem("auth_token");

  useEffect(() => {
    if (!token) {
      window.location.href = "/signin";
      return;
    }
    fetchUsers();
    fetchCatalog();
  }, [token]); // ✅ FIX: Added token to dependency array

  const fetchUsers = async () => {
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
      const message = err instanceof Error ? err.message : "Failed to load users. Are you admin?";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCatalog = async () => {
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
  };

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
          description: "Added via Admin Panel"
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
      const payload = { targetUserId: parseInt(selectedUser.id.toString()), attributes: finalAttrList.join(",") };
      const res = await fetch(`${baseUrl}/admin/assign-attributes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
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


  const createSubAdmin = async () => {
    if (!newSubAdmin.username || !newSubAdmin.email || !newSubAdmin.password) {
      setError("Please fill in all fields (username, email, password)");
      return;
    }
    setIsCreating(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/admin/subadmin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newSubAdmin)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create Sub-Admin");
      }
      
      setSuccess(`Sub-Admin ${newSubAdmin.username} created successfully!`);
      setShowCreateModal(false);
      setNewSubAdmin({ username: "", email: "", password: "" }); 
      await fetchUsers(); 
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating Sub-Admin");
    } finally {
      setIsCreating(false);
    }
  };

  const parseAttributes = (attrString: string | undefined): string[] => {
    if (!attrString) return [];
    return attrString.split(",").map(a => a.trim()).filter(a => a && !a.startsWith("ID:"));
  };

  // user list based on search and filter
  const filteredUsers = users.filter((user) => {
    const matchRole = filterRole === "ALL" || user.role === filterRole;
    const matchSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div >
      <div className="max-w-6xl mx-auto">
        

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

        {/* Block 2: User Management Search & Filters */}
        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-sm dark:shadow-xl transition-colors duration-300">
          
          <div className="p-6 border-b border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row justify-between items-center gap-4 transition-colors">
            
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700/50 transition-colors">
              <Filter className="w-4 h-4 text-slate-400 ml-2" />
              <button onClick={() => setFilterRole("ALL")} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${filterRole === "ALL" ? "bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}>
                All
              </button>
              <button onClick={() => setFilterRole("SUB_ADMIN")} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${filterRole === "SUB_ADMIN" ? "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300" : "text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-300"}`}>
                Sub-Admins
              </button>
              <button onClick={() => setFilterRole("USER")} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${filterRole === "USER" ? "bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}>
                Users
              </button>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search user..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-semibold transition-all text-sm whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                New Sub-Admin
              </button>
            </div>
          </div>

          {/* ... User Table logic ... */}


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
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Role</th> 
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 w-[420px]">Attributes</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                        <AlertCircle className="w-6 h-6 mx-auto mb-2 opacity-50" />
                        No users found matching your criteria
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-slate-200 dark:border-slate-700/30 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">#{user.id}</td>
                        <td className="px-6 py-4" >
                          <div className="font-bold text-slate-900 dark:text-slate-200">{user.username}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">{user.email}</div>
                        </td>
                        
                        {/* === role === */}
                        <td className="px-6 py-4">
                          {user.role === 'SUB_ADMIN' ? (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30 transition-colors">
                              Sub-Admin
                            </span>
                          ) : user.role === 'ADMIN' ? (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30 transition-colors">
                              Super Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 transition-colors">
                              User
                            </span>
                          )}
                        </td>
                          {/*== attribute == */}
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
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 hover:text-emerald-700 dark:bg-emerald-600/20 dark:border-emerald-500/50 dark:text-emerald-400 dark:hover:bg-emerald-600/40 transition-all text-xs font-semibold"
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

      {/* Assign Attributes Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-colors">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-xl dark:shadow-2xl w-full max-w-md overflow-hidden transition-colors">

            <div className="p-6 border-b border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center transition-colors">
              <h3 className="font-display text-lg text-slate-900 dark:text-slate-100">
                Assign Attributes for{" "}
                <span className="text-emerald-600 dark:text-emerald-400">{selectedUser.username}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
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
                <p className="text-xs text-slate-500 mt-2">
                  Tip: Separate multiple attributes with commas. The system will automatically preserve the user's ID.
                </p>
              </div>

              {parseAttributes(newAttributes).length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Preview:</p>
                  <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 transition-colors">
                    {parseAttributes(newAttributes).map((attr) => (
                      <span
                        key={attr}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/50 text-emerald-700 dark:text-emerald-300 text-xs font-medium transition-colors"
                      >
                        <Check className="w-3 h-3" />
                        {attr}
                      </span>
                    ))}
                  </div>
                </div>
              )}
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

      {/* === Sub-Admin window === */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-colors">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-xl dark:shadow-2xl w-full max-w-md overflow-hidden transition-colors">
            
            <div className="p-6 border-b border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center transition-colors">
              <h3 className="font-display text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Create Sub-Admin
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
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
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block">Username</label>
                <input 
                  type="text" 
                  value={newSubAdmin.username}
                  onChange={(e) => setNewSubAdmin({...newSubAdmin, username: e.target.value})}
                  placeholder="Enter username"
                  disabled={isCreating}
                  autoComplete="off"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-lg text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 dark:focus:ring-emerald-500/50 disabled:opacity-50 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block">Email</label>
                <input 
                  type="email" 
                  value={newSubAdmin.email}
                  onChange={(e) => setNewSubAdmin({...newSubAdmin, email: e.target.value})}
                  placeholder="Enter email"
                  disabled={isCreating}
                  autoComplete="off"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-lg text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 dark:focus:ring-emerald-500/50 disabled:opacity-50 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block">Initial Password</label>
                <input 
                  type="password" 
                  value={newSubAdmin.password}
                  onChange={(e) => setNewSubAdmin({...newSubAdmin, password: e.target.value})}
                  placeholder="Enter password"
                  disabled={isCreating}
                  autoComplete="new-password"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-lg text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 dark:focus:ring-emerald-500/50 disabled:opacity-50 transition-all"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/20 flex gap-3 transition-colors">
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={isCreating}
                className="flex-1 py-2.5 px-4 rounded-lg border border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600/50 transition-all text-sm font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={createSubAdmin}
                disabled={isCreating || !newSubAdmin.username || !newSubAdmin.email || !newSubAdmin.password}
                className="flex-1 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all text-sm font-semibold"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Confirm Creation
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