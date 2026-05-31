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
// SubAdmin.tsx - Sub-Admin dashboard for attribute management
// ============================================================================

import { DashboardLayout } from "@/components/DashboardLayout";
import { SubAdminPanel } from "@/components/SubadminPanel";

// ----------------------------------------------------------------------------
// SubAdmin Page Component
// ----------------------------------------------------------------------------
export default function SubAdmin() {
  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Page header with title and rich description */}
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl mb-2 text-slate-900 dark:text-white">
            Attributes Management Panel
          </h1>

          {/* Rich description similar to other admin pages */}
          <div className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed space-y-2">
            <p>
              As a{" "}
              <strong className="font-semibold text-cyan-600 dark:text-cyan-400">
                Sub‑Admin
              </strong>
              , you can manage user attributes for your department or team. This
              panel allows you to assign and revoke attributes to regular users,
              controlling their access to encrypted files.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                View all users in the system and their currently assigned
                attributes
              </li>
              <li>
                Assign new attributes to users (e.g.,{" "}
                <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">
                  Department:IT
                </code>
                ,{" "}
                <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">
                  Level:2
                </code>
                )
              </li>
              <li>
                Revoke existing attributes by updating the user's attribute list
              </li>
            </ul>
          </div>
        </div>

        {/* SubAdminPanel component - contains the user list and attribute assignment interface */}
        <div className="mb-8">
          <SubAdminPanel />
        </div>
      </div>
    </DashboardLayout>
  );
}
