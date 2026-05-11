import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/DashboardLayout";
import { getAdminUsers, getAllFiles, getMyAttributes } from "@/lib/api";
import {
  AlertCircle,
  Archive,
  ArrowRight,
  FileText,
  Folder,
  Lock,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Upload,
  User,
  Users,
} from "lucide-react";

type BackendUser = {
  id?: number;
  userId?: number;
  username?: string;
  email?: string;
  role?: "ADMIN" | "SUB_ADMIN" | "USER" | string;
  attributes?: string;
};

type BackendFile = {
  id?: number;
  filename?: string;
  name?: string;
  policy?: string;
  isDir?: boolean;
  ownerId?: number;
  owner_id?: number;
  uploadTime?: string;
  upload_time?: string;
  accessible?: boolean;
};

type DisplayFile = {
  id: string;
  name: string;
  type: "folder" | "file";
  policy: string;
  owner: string;
  lastModified: string;
  accessLabel: "Private" | "Shared" | "ABE Protected" | "Public";
  accessible: boolean;
};

const getToken = () => localStorage.getItem("auth_token");
const getUsername = () => localStorage.getItem("username") || "User";
const getUserRole = () => localStorage.getItem("user_role") || "USER";
const getUserId = () => localStorage.getItem("user_id") || "";

function parseAttributes(raw?: string | null) {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map(String).filter(Boolean);
    }
  } catch {
    // If it is not JSON, use comma split below.
  }

  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function cleanAttributes(raw?: string | null) {
  return parseAttributes(raw).filter((attr) => !attr.startsWith("ID:"));
}

function formatRole(role?: string) {
  if (role === "ADMIN") return "Super Admin";
  if (role === "SUB_ADMIN") return "Sub-Admin";
  return "User";
}

function roleBadgeClass(role?: string) {
  if (role === "ADMIN") {
    return "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20";
  }

  if (role === "SUB_ADMIN") {
    return "bg-cyan-50 text-cyan-600 border-cyan-100 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/20";
  }

  return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
}

function fileAccessLabel(policy?: string): DisplayFile["accessLabel"] {
  if (!policy || policy.trim() === "") return "Public";

  if (
    policy.includes("Dep:") ||
    policy.includes("Role:") ||
    policy.includes("Team:") ||
    policy.includes("ADMIN") ||
    policy.includes("SUB_ADMIN")
  ) {
    return "ABE Protected";
  }

  if (policy.startsWith("ID:") && !policy.includes(",")) {
    return "Private";
  }

  return "Shared";
}

function formatDate(value?: string) {
  if (!value) return "Unknown";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function getFileName(file: BackendFile) {
  return file.filename || file.name || `Item ${file.id ?? ""}`;
}

function toDisplayFile(file: BackendFile): DisplayFile {
  const ownerId = file.ownerId ?? file.owner_id;
  const policy = file.policy || "";

  return {
    id: String(file.id ?? getFileName(file)),
    name: getFileName(file),
    type: file.isDir ? "folder" : "file",
    policy: policy || "No policy",
    owner: ownerId ? `User ${ownerId}` : "Unknown",
    lastModified: formatDate(file.uploadTime || file.upload_time),
    accessLabel: fileAccessLabel(policy),
    accessible: file.accessible ?? true,
  };
}

function getInitials(name: string) {
  if (!name) return "U";

  const parts = name.trim().split(/\s+/);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return name.substring(0, 2).toUpperCase();
}

function AccessBadge({ label }: { label: DisplayFile["accessLabel"] }) {
  const classes = {
    Private:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    Shared:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
    "ABE Protected":
      "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300",
    Public:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${classes[label]}`}
    >
      {label}
    </span>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900/40">
      <Folder className="mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
      <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
}

export default function Homepage() {

  const [, navigate] = useLocation();

  const [files, setFiles] = useState<DisplayFile[]>([]);
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [myAttributes, setMyAttributes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const username = getUsername();
  const userRole = getUserRole();
  const userId = getUserId();
  const token = getToken();
  // const isAdmin = userRole === "ADMIN" || userRole === "SUB_ADMIN";
  
  const role = localStorage.getItem("user_role");
  const isAdmin = role === "ADMIN" || role === "SUB_ADMIN";
  const loadDashboardData = async () => {
    if (!token) {
      navigate("/signin");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [attributeResult, fileResult] = await Promise.all([
        getMyAttributes().catch(() => null),
        getAllFiles().catch(() => []),
      ]);

      const attrString =
        attributeResult?.attributes ||
        localStorage.getItem("user_attributes") ||
        "";

      setMyAttributes(cleanAttributes(attrString));

      const normalizedFiles = Array.isArray(fileResult)
        ? fileResult.map(toDisplayFile)
        : [];

      setFiles(normalizedFiles);

      if (isAdmin) {
        const userResult = await getAdminUsers().catch(() => []);
        setUsers(Array.isArray(userResult) ? userResult : []);
      }
    } catch (err) {
      console.error(err);
      setError(
        "Failed to load homepage data. Please check whether the backend is running and your token is valid."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredFiles = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return files;

    return files.filter(
      (file) =>
        file.name.toLowerCase().includes(q) ||
        file.policy.toLowerCase().includes(q) ||
        file.owner.toLowerCase().includes(q)
    );
  }, [files, query]);

  const folders = files.filter((file) => file.type === "folder");
  const fileOnlyItems = files.filter((file) => file.type === "file");
  const protectedCount = files.filter(
    (file) => file.accessLabel === "ABE Protected"
  ).length;
  const sharedCount = files.filter(
    (file) => file.accessLabel === "Shared"
  ).length;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-white sm:p-8">
        {/* Top Search */}
        {/* <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex h-12 w-full max-w-2xl items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Search className="h-5 w-5 text-slate-400" />

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search files, folders, and policies"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadDashboardData}
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
            >
              <Upload className="h-4 w-4" />
              Upload & Encrypt
            </button>
          </div>
        </div> */}

        {/* Header */}
        <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                <ShieldCheck className="h-4 w-4" />
                Backend connected · ABE protected storage
              </div>

              <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Welcome to SecureShare
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
                Secure cloud storage with Attribute-Based Encryption. Upload
                files, apply access policies, and manage sharing based on
                backend users and attributes.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
                  {getInitials(username)}
                </div>

                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {username}
                  </p>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {formatRole(userRole)} {userId ? `· ID ${userId}` : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Stats */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
              <FileText className="h-5 w-5" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Total items
            </p>
            <p className="mt-1 text-3xl font-bold">
              {loading ? "--" : files.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
              <Shield className="h-5 w-5" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              ABE protected
            </p>
            <p className="mt-1 text-3xl font-bold">
              {loading ? "--" : protectedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-300">
              <Users className="h-5 w-5" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Shared policies
            </p>
            <p className="mt-1 text-3xl font-bold">
              {loading ? "--" : sharedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">
              <User className="h-5 w-5" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              My attributes
            </p>
            <p className="mt-1 text-3xl font-bold">
              {loading ? "--" : myAttributes.length}
            </p>
          </div>
        </section>

        {/* Suggested folders */}
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Suggested Folders
            </h2>

            <button
              onClick={() => navigate("/explorer")}
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-300"
            >
              View all
            </button>
          </div>

          {loading ? (
            <EmptyState message="Loading folders from backend..." />
          ) : folders.length === 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                "Root Directory",
                "Encrypted Files",
                "Shared Projects",
                "Personal Docs",
              ].map((name, index) => (
                <div
                  key={name}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                      <Folder className="h-6 w-6" />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {name}
                      </p>

                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {index === 0 ? `${fileOnlyItems.length} files` : "Ready"}
                      </p>

                      <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                        <ShieldCheck className="h-4 w-4" />
                        Synced with backend
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {folders.slice(0, 4).map((folder) => (
                <div
                  key={folder.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                      <Folder className="h-6 w-6" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900 dark:text-white">
                        {folder.name}
                      </p>

                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Folder
                      </p>

                      <div className="mt-3">
                        <AccessBadge label={folder.accessLabel} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Files and admin users */}
        <section className="grid gap-8 xl:grid-cols-[1.5fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Recent Files
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Data from GET /abe/list
                </p>
              </div>

              <button
                onClick={() => navigate("/explorer")}
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-300"
              >
                File explorer <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {loading ? (
              <EmptyState message="Loading file list..." />
            ) : filteredFiles.length === 0 ? (
              <EmptyState message="No files found. Upload and encrypt your first file." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                      <th className="px-6 py-4 font-semibold">Name</th>
                      <th className="px-6 py-4 font-semibold">
                        Access Policy
                      </th>
                      <th className="px-6 py-4 font-semibold">Owner</th>
                      <th className="px-6 py-4 font-semibold">
                        Last Modified
                      </th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredFiles.slice(0, 8).map((file) => (
                      <tr
                        key={file.id}
                        className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                              {file.type === "folder" ? (
                                <Folder className="h-5 w-5" />
                              ) : (
                                <Archive className="h-5 w-5" />
                              )}
                            </div>

                            <span className="font-semibold text-slate-800 dark:text-slate-100">
                              {file.name}
                            </span>
                          </div>
                        </td>

                        <td className="max-w-[280px] px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4 shrink-0 text-slate-400" />
                            <span
                              className="truncate text-slate-500 dark:text-slate-400"
                              title={file.policy}
                            >
                              {file.policy}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                          {file.owner}
                        </td>

                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                          {file.lastModified}
                        </td>

                        <td className="px-6 py-4">
                          <AccessBadge label={file.accessLabel} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="space-y-8">
            {/* My Attributes */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                My ABE Attributes
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Data from GET /abe/my-attributes
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {loading ? (
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Loading...
                  </span>
                ) : myAttributes.length > 0 ? (
                  myAttributes.map((attr) => (
                    <span
                      key={attr}
                      className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                    >
                      {attr}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    No attributes assigned yet.
                  </span>
                )}
              </div>
            </div>

            {/* Admin User Management */}
            {isAdmin && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      User Management
                    </h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Data from GET /abe/admin/users
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      navigate(userRole === "ADMIN" ? "/admin" : "/sub_admin")
                    }
                    className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-300"
                  >
                    Manage
                  </button>
                </div>

                {loading ? (
                  <EmptyState message="Loading users..." />
                ) : users.length === 0 ? (
                  <EmptyState message="No users returned from backend." />
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {users.slice(0, 5).map((user) => {
                      const id = user.id ?? user.userId;
                      const userAttributes = cleanAttributes(user.attributes);

                      return (
                        <div key={id ?? user.email} className="px-6 py-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900 dark:text-white">
                                {user.username || "Unnamed User"}
                              </p>

                              <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                                {user.email || "No email"}
                              </p>
                            </div>

                            <span
                              className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${roleBadgeClass(
                                user.role
                              )}`}
                            >
                              {formatRole(user.role)}
                            </span>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {userAttributes.length > 0 ? (
                              userAttributes.slice(0, 4).map((attr) => (
                                <span
                                  key={attr}
                                  className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                                >
                                  {attr}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs italic text-slate-400">
                                No attributes
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}