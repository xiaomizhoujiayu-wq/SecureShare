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
// Profile.tsx - User profile page displaying cryptographic identity and attributes
// ============================================================================

import { DashboardLayout } from "@/components/DashboardLayout";
import { IdentityStatus } from "@/components/IdentityStatus";

// ----------------------------------------------------------------------------
// Profile Page Component
// ----------------------------------------------------------------------------
export default function Profile() {
  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Page header with title and rich description */}
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl mb-2 text-slate-900 dark:text-white">
            Identity Panel
          </h1>

          {/* Rich description similar to Admin and Dashboard pages */}
          <div className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed space-y-2">
            <p>
              Your cryptographic identity is the foundation of the ABE
              (Attribute‑Based Encryption) system. This panel shows the
              attributes assigned to you, which determine which encrypted files
              you can decrypt.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong className="font-semibold text-cyan-600 dark:text-cyan-400">
                  Unique UID
                </strong>{" "}
                – Your permanent user identifier used for direct (private) file
                sharing
              </li>
              <li>
                <strong className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Active Attributes
                </strong>{" "}
                – The set of attributes (e.g.,{" "}
                <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">
                  Department:IT
                </code>
                ,{" "}
                <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">
                  Level:3
                </code>
                ) assigned to your account
              </li>
              <li>
                <strong className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Key Health
                </strong>{" "}
                – Status of your CP‑ABE private key (generated automatically
                when attributes are assigned)
              </li>
              <li>
                Copy your UID with one click to share it with others for private
                file sharing
              </li>
            </ul>
          </div>
        </div>

        {/* Identity Status Component - displays UID, attributes, and key health */}
        <div className="mb-8">
          <IdentityStatus />
        </div>

        {/* Attribute Marketplace (commented out - reserved for future feature) */}
        {/* <div className="mb-8">
          <AttributeMarketplace />
        </div> */}
      </div>
    </DashboardLayout>
  );
}
