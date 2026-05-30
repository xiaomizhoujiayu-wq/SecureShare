// ============================================================================
// SubAdminPanel.tsx - Sub-Admin interface for managing user attributes
// ============================================================================

import { AlertCircle, Check, Edit2, Loader2, Users, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getAdminUsers } from "@/lib/api";
import { getMyAttributes } from "@/lib/api";
import { assignUserAttrs } from "@/lib/api";

// ----------------------------------------------------------------------------
// Type definitions
// ----------------------------------------------------------------------------

interface User {
  id: number;
  username: string;
  email: string;
  attributes: string;
}

// ----------------------------------------------------------------------------
// Main SubAdminPanel component
// ----------------------------------------------------------------------------
export function SubAdminPanel() {
  // State management
  const [users, setUsers] = useState<User[]>([]); // List of all users
  const [catalog, setCatalog] = useState<string[]>([]); // Available attributes (catalog)
  const [loading, setLoading] = useState(false); // Loading indicator
  const [showModal, setShowModal] = useState(false); // Attribute assignment modal visibility
  const [selectedUser, setSelectedUser] = useState<User | null>(null); // User being edited
  const [newAttributes, setNewAttributes] = useState(""); // Comma-separated attributes to assign
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for async ops
  const [error, setError] = useState<string | null>(null); // Error message to display

  const token = localStorage.getItem("auth_token"); // Auth token for validation

  // --------------------------------------------------------------------------
  // Fetch all users (only accessible to Sub-Admin / Admin)
  // --------------------------------------------------------------------------
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminUsers();
      console.log(data);
      setUsers(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load users. Are you admin?";
      setError(message);
      console.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // --------------------------------------------------------------------------
  // Fetch attribute catalog (user's own attributes without ID: prefix)
  // --------------------------------------------------------------------------
  const fetchCatalog = useCallback(async () => {
    try {
      const data = await getMyAttributes();
      console.log(data);
      console.log(data.attributes);

      const rawAttrString = data.attributes || "";
      const attrArray = rawAttrString.trim()
        ? rawAttrString
            .split(",")
            .map((s: string) => s.trim())
            .filter((s: string) => !s.startsWith("ID:"))
        : [];

      console.log(attrArray);
      setCatalog(attrArray);
    } catch (err) {
      console.error("Failed to fetch catalog:", err);
    }
  }, []);

  // Redirect to sign-in if no token, otherwise load data
  useEffect(() => {
    if (!token) {
      window.location.href = "/signin";
      return;
    }
    fetchUsers();
    fetchCatalog();
  }, [fetchUsers, fetchCatalog, token]);

  // --------------------------------------------------------------------------
  // Open modal to assign attributes to a specific user
  // --------------------------------------------------------------------------
  const openAssignModal = (user: User) => {
    setSelectedUser(user);
    // Extract existing attributes, filtering out internal ID attributes
    const allAttrs = user.attributes ? user.attributes.split(",") : [];
    const displayAttrs = allAttrs.filter(
      (attr) => !attr.trim().startsWith("ID:"),
    );
    setNewAttributes(displayAttrs.join(","));
    setShowModal(true);
    setError(null);
  };

  // --------------------------------------------------------------------------
  // Submit attribute assignment for the selected user
  // --------------------------------------------------------------------------
  const submitAssignment = async () => {
    if (!selectedUser) return;

    if (!newAttributes.trim()) {
      setError("Please enter at least one attribute");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Parse comma-separated attributes, trim each, remove any ID: prefix
      const finalAttrList = newAttributes
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a && !a.startsWith("ID:"));

      const targetUserId = parseInt(selectedUser.id.toString());
      const attributesString = finalAttrList.join(",");
      await assignUserAttrs(targetUserId, attributesString);

      // Close modal, clear state, refresh user list
      setShowModal(false);
      setNewAttributes("");
      setSelectedUser(null);
      await fetchUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Request error";
      setError(message);
      console.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------------------------------
  // Helper: Parse attribute string into array, filtering out ID attributes
  // --------------------------------------------------------------------------
  const parseAttributes = (attrString: string | undefined): string[] => {
    if (!attrString) return [];
    return attrString
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a && !a.startsWith("ID:"));
  };

  // --------------------------------------------------------------------------
  // Render JSX
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 sm:p-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Header with title and icon */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-display text-3xl text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            User Management
          </h1>
        </div>

        {/* User table panel */}
        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-sm dark:shadow-xl transition-colors duration-300">
          {loading ? (
            // Loading spinner
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-600 dark:text-cyan-500" />
              <p className="text-sm">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm table-auto">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700/50 transition-colors duration-300">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                      ID
                    </th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                      Username
                    </th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                      Email
                    </th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                      Attributes
                    </th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    // Empty state
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-slate-500 dark:text-slate-400"
                      >
                        <AlertCircle className="w-6 h-6 mx-auto mb-2 opacity-50" />
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user, index) => (
                      <tr
                        key={user.id}
                        className="border-b border-slate-200 dark:border-slate-700/30 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Index number (starting from 1) */}
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                          #{index + 1}
                        </td>
                        {/* Username */}
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">
                          {user.username}
                        </td>
                        {/* Email */}
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">
                          {user.email}
                        </td>
                        {/* Attribute badges */}
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {parseAttributes(user.attributes).length > 0 ? (
                              parseAttributes(user.attributes).map((attr) => (
                                <span
                                  key={attr}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/50 text-emerald-700 dark:text-emerald-300 text-xs font-medium transition-colors"
                                >
                                  <Check className="w-3 h-3" />
                                  {attr}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-500 dark:text-slate-400 text-xs italic">
                                No attributes
                              </span>
                            )}
                          </div>
                        </td>
                        {/* Action button: Assign */}
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => openAssignModal(user)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-600/20 border border-emerald-200 dark:border-emerald-500/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-600/30 hover:border-emerald-300 dark:hover:border-emerald-500/70 transition-all text-sm font-semibold"
                          >
                            <Edit2 className="w-4 h-4" />
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

      {/* ---------- Assign Attributes Modal ---------- */}
      {showModal && selectedUser && (
        <div
          role="dialog"
          className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-md overflow-hidden">
            {/* Modal header */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 border-b border-slate-200 dark:border-slate-700/50 flex justify-between items-center">
              <h3 className="font-display text-lg text-slate-800 dark:text-slate-100">
                Assign Attributes for{" "}
                <span className="text-emerald-600 dark:text-emerald-400">
                  {selectedUser.username}
                </span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <p className="text-xs text-red-300">{error}</p>
                </div>
              )}

              {/* Textarea for entering attributes */}
              <div>
                <label className="text-xs font-semibold text-emerald-800 dark:text-emerald-500 uppercase tracking-widest mb-2 block">
                  Attributes
                </label>
                <textarea
                  rows={2}
                  value={newAttributes}
                  onChange={(e) => setNewAttributes(e.target.value)}
                  placeholder="e.g., Dept:Finance, Role:Manager"
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800/50 border border-emerald-700/50 rounded-lg text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 dark:focus:border-emerald-500/50 focus:ring-emerald-500 dark:focus:ring-emerald-500/50"
                />
                <p className="text-xs text-emerald-400 dark:text-emerald-500 mt-2">
                  Tip: Separate multiple attributes with commas.
                </p>
              </div>

              {/* Available attributes catalog - click to add */}
              {catalog && catalog.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">
                    Available Attributes to Assign:
                  </p>
                  <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
                    {catalog.map((attr) => (
                      <button
                        key={attr}
                        type="button"
                        onClick={() => {
                          if (!newAttributes.includes(attr)) {
                            setNewAttributes((prev) =>
                              prev ? `${prev}, ${attr}` : attr,
                            );
                          }
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900 border border-emerald-300 dark:border-emerald-600 text-emerald-500 dark:text-emerald-300 text-xs font-medium hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300 dark:hover:bg-emerald-500/20 dark:hover:text-emerald-300 dark:hover:border-emerald-500/50 transition-colors cursor-pointer"
                      >
                        {attr}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal footer buttons */}
            <div className="p-6 bg-slate-100 dark:bg-slate-900/20 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 rounded-lg bg-slate-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all"
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
                  <>Update Attributes</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
