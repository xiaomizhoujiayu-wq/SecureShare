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
// FileExplorer.tsx - Secure file explorer page for viewing and managing encrypted files
// ============================================================================

import { DashboardLayout } from "@/components/DashboardLayout";
import { SecureFileExplorer } from "@/components/FileExplorer";

// ----------------------------------------------------------------------------
// FileExplorer Page Component
// ----------------------------------------------------------------------------
export default function FileExplorer() {
  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Page header with title and rich description */}
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl mb-2 text-slate-900 dark:text-white">
            File Management Panel
          </h1>

          {/* Rich description similar to Admin and Dashboard pages */}
          <div className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed space-y-2">
            <p>
              This panel gives you a complete overview of all encrypted files
              you have access to. Files are automatically filtered based on your
              cryptographic identity and the policies defined by their owners.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong className="font-semibold text-cyan-600 dark:text-cyan-400">
                  Shared With Me
                </strong>{" "}
                – Files shared by other users that your attributes (or direct
                UID) allow you to decrypt
              </li>
              <li>
                <strong className="font-semibold text-emerald-600 dark:text-emerald-400">
                  My Uploaded Files
                </strong>{" "}
                – Files you have encrypted and uploaded, which you can manage or
                delete
              </li>
            </ul>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              File decryption happens entirely in your browser – no plaintext
              data is ever sent over the network.
            </p>
          </div>
        </div>

        {/* Secure File Explorer component - displays two tables (shared with me / my uploaded files) */}
        <div className="mb-8">
          <SecureFileExplorer />
        </div>
      </div>
    </DashboardLayout>
  );
}
