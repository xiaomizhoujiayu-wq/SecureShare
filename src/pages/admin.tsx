/*
 * Copyright (C) 2026 Yumi/acdd233/puchen-star
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
// ============================================================================
// Admin.tsx - Super Admin dashboard page
// ============================================================================

import { AdminPanel } from "@/components/AssignAttribute";
import { DashboardLayout } from "@/components/DashboardLayout";

// ----------------------------------------------------------------------------
// Admin Page Component
// ----------------------------------------------------------------------------
export default function Admin() {
  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Page header with title and description */}
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl mb-2 text-slate-900 dark:text-white">
            Super Admin Panel
          </h1>

          {/* Rich description of Super Admin capabilities */}
          <div className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed space-y-2">
            <p>
              As a{" "}
              <strong className="font-semibold text-emerald-600 dark:text-emerald-400">
                Super Admin
              </strong>
              , you have full control over the system's cryptographic identity
              infrastructure. Use this panel to:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                Create and delete attributes in the global catalog (e.g.,{" "}
                <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">
                  Department:IT
                </code>
                ,{" "}
                <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">
                  Level:3
                </code>
                )
              </li>
              <li>
                Assign or revoke attributes for any user, defining their access
                rights for policy‑based file sharing
              </li>
              <li>
                Create new Sub‑Admin accounts with limited user management
                permissions
              </li>
              <li>
                Oversee all users and their current attribute sets from a single
                dashboard
              </li>
            </ul>
          </div>
        </div>

        {/* AdminPanel component - contains the actual attribute and user management UI */}
        <div className="mb-8">
          <AdminPanel />
        </div>
      </div>
    </DashboardLayout>
  );
}
