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
  Fingerprint,
  Info,
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
      <div className="min-h-screen bg-slate-50 p-6 text-slate-900 dark:bg-slate-900 dark:text-white sm:p-8">
        {/* Top bar */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Overview
            </h1>

        </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadDashboardData}
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-100 dark:border-slate-500 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
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
        </div>

        {/* Welcome Banner */}
        <section className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          {/* left side */}
          <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                <ShieldCheck className="h-4 w-4" />
                CP-ABE Protected Storage
              </div>

              <h2 className="text-2xl font-bold tracking-tight">
                Welcome back, {username}
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Upload, encrypt, and manage secure files with
                attribute-based access policies.
              </p>
            </div>
          <div className="my-6 h-px w-full bg-slate-200 dark:bg-slate-700 lg:my-0 lg:h-20 lg:w-px" />

          {/* right side */}
          <div className="lg:min-w-[280px] lg:pl-8">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-500">
              Active Attributes
            </p>

            <div className="flex flex-wrap gap-2">
              {loading ? (
                [1, 2].map((i) => (
                  <div key={i} className="h-6 w-16 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                ))
              ) : myAttributes?.length > 0 ? (
                myAttributes.map((attr) => (
                  <span
                    key={attr}
                    className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium text-emerald-700 shadow-sm ring-1 ring-inset ring-emerald-600/20 bg-emerald-500/20 dark:bg-emerald-500/50 dark:text-emerald-300 dark:ring-emerald-500/30"
                  >
                    {attr}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-400">No attributes</span>
              )}
            </div>
          </div>

          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Stats */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total Items",
              value: loading ? "--" : files.length,
              icon: FileText,
              color: "text-emerald-500 bg-emerald-500/10",
            },
            {
              label: "ABE Protected",
              value: loading ? "--" : protectedCount,
              icon: Shield,
              color: "text-blue-500 bg-blue-500/10",
            },
            {
              label: "Shared Policies",
              value: loading ? "--" : sharedCount,
              icon: Users,
              color: "text-cyan-500 bg-cyan-500/10",
            },
            {
              label: "My Attributes",
              value: loading ? "--" : myAttributes.length,
              icon: User,
              color: "text-violet-500 bg-violet-500/10",
            },
          ].map((stat) => (
            <div
        key={stat.label}
          className="group rounded-2xl border border-slate-200 bg-white dark:bg-slate-800 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-700"
        >
          <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${stat.color}`}>
            <stat.icon className="h-5 w-5" />
          </div>

          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {stat.label}
          </p>

          <div className="mt-1 flex items-baseline">
            {loading ? (
              <div className="h-9 w-16 animate-pulse rounded-md bg-slate-100 dark:bg-slate-800" />
            ) : (
              <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                {stat.value}
              </p>
            )}
          </div>
            </div>
          ))}
        </section>

        <section className={`grid gap-4 ${isAdmin ? "xl:grid-cols-4" : "xl:grid-cols-1"}`}>
          {/* Recent Files */}
          <div className="xl:col-span-3 rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-700">
              <div>
                <h2 className="text-xl font-bold text-emerald-500">
                  Recent Files
                </h2>
              </div>

              <button
                onClick={() => navigate("/explorer")}
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-300"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              {loading ? (
                <EmptyState message="Loading files..." />
              ) : filteredFiles.length === 0 ? (
                <EmptyState message="No files uploaded yet." />
              ) : (
                <div className="space-y-3">
                  {filteredFiles.slice(0, 6).map((file) => (
                    <div
                      key={file.id}
                      className="
                        flex flex-col gap-4
                        rounded-2xl
                        border border-slate-200
                        bg-white/80
                        p-4
                        backdrop-blur-sm
                        transition-all duration-300
                        hover:border-emerald-200
                        hover:shadow-md

                        dark:border-slate-600
                        dark:bg-slate-800/50
                        dark:hover:border-emerald-500/30

                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                      "
                    >
                      {/* LEFT */}
                      <div className="flex min-w-0 items-center gap-4">
                        
                        {/* ICON */}
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                          {file.type === "folder" ? (
                            <Folder className="h-5 w-5" />
                          ) : (
                            <Archive className="h-5 w-5" />
                          )}
                        </div>

                        {/* CONTENT */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
                            {file.name}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-2">

                            <Lock className="h-3.5 w-3.5 text-slate-400" />
                            <p>Access Policy: </p>

                            {file.policy?.split(",")
                                .map(p => p.trim())
                                .filter(Boolean)
                                .length === 1 &&
                              file.policy?.trim().toLowerCase().startsWith("id") ? (
                              <span className="
                                  inline-flex items-center
                                  rounded-full
                                  border border-emerald-500/20
                                  bg-emerald-500/10
                                  px-2.5 py-1
                                  text-[11px]
                                  font-semibold
                                  text-emerald-600
                                  dark:text-emerald-300
                              ">
                                Private Share
                              </span>
                            ) : (
                              file.policy
                                .split(",")
                                .map((tag) => tag.trim())
                                .filter(Boolean)
                                .map((tag, index) => (
                                  <span
                                    key={`${tag}-${index}`}
                                    className="
                                      inline-flex items-center
                                      rounded-full
                                      border border-emerald-500/20
                                      bg-emerald-500/10
                                      px-2.5 py-1
                                      text-[11px]
                                      font-semibold
                                      text-emerald-600
                                      dark:text-emerald-300
                                    "
                                  >
                                    {tag}
                                  </span>
                                ))
                            )}
                          </div>
                        </div>
                      </div>

                    </div>
                        ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Admin */}
            {isAdmin && (
              <div className="xl:col-span-1 rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-800">
                <div className="flex w-full items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
                  <div>
                    <h2 className="text-xl font-bold">
                      User Management
                    </h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Users and their attributes
                    </p>
                  </div>


                </div>

                <div className="space-y-3 p-4">
                  {users.slice(0, 4).map((user) => {
                    const id = user.id ?? user.userId;
                    const userAttributes = cleanAttributes(user.attributes);

                    return (
                      <div
                        key={id ?? user.email}
                        className="
                          rounded-2xl
                          border border-slate-200
                          bg-slate-50/80
                          p-4
                          transition-all duration-300
                          hover:border-emerald-200
                          hover:bg-white
                          hover:shadow-sm

                          dark:border-slate-700
                          dark:bg-slate-800/50
                          dark:hover:border-emerald-500/20
                        "
                      >
                        {/* TOP */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
                              {user.username || "Unnamed User"}
                            </p>

                            <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                              {user.email}
                            </p>
                          </div>

                          <span
                            className={`
                              shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold
                              ${roleBadgeClass(user.role)}
                            `}
                          >
                            {formatRole(user.role)}
                          </span>
                        </div>

                        {/* ATTRIBUTES */}
                        <div className="mt-4 flex flex-wrap gap-2">
                          {userAttributes.length > 0 ? (
                            userAttributes.slice(0, 3).map((attr) => (
                              <span
                                key={attr}
                                className="
                                  inline-flex items-center
                                  rounded-full
                                  bg-emerald-500/10
                                  px-2.5 py-1
                                  text-[11px]
                                  font-medium
                                  text-emerald-600
                                  dark:text-emerald-300
                                "
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
                  <div className="border-t border-slate-200 p-4 dark:border-slate-700">
                    <button
                      onClick={() =>
                        navigate(
                          userRole === "ADMIN"
                            ? "/admin"
                            : "/sub_admin"
                        )
                      }
                      className="
                        inline-flex w-full items-center justify-center gap-2
                        rounded-2xl
                        bg-emerald-500
                        px-4 py-3
                        text-sm font-semibold text-white
                        transition-all duration-300

                        hover:bg-emerald-600
                        hover:shadow-lg hover:shadow-emerald-500/20

                        active:scale-[0.98]
                      "
                    >
                      Manage Users
                    </button>
                  </div>
                </div>
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}