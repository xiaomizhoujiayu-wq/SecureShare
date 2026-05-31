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
// Dashboard.tsx - Main dashboard page for file encryption and upload
// ============================================================================

import { DashboardLayout } from "@/components/DashboardLayout";
import { EncryptionWizard } from "@/components/EncryptionWizard";

// ----------------------------------------------------------------------------
// Dashboard Page Component
// ----------------------------------------------------------------------------
export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Page header with title and rich description */}
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl mb-2 text-slate-900 dark:text-white">
            File Encryption & Upload Panel
          </h1>

          {/* Rich description similar to Admin panel */}
          <div className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed space-y-2">
            <p>
              This panel allows you to securely encrypt and upload file . You
              control exactly who can decrypt each file by defining an access
              policy.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Select a file to encrypt (PDF, DOCX, PNG, JPG, ZIP, etc.)</li>
              <li>
                Choose between <strong>Group Share</strong> (policy‑based) or{" "}
                <strong>Private Share</strong> (direct user ID)
              </li>
              <li>
                For Group Share, pick attributes from your own identity catalog
                (e.g.,{" "}
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
                For Private Share, enter the recipient's unique UID (e.g.,{" "}
                <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">
                  ID:xxx-xxx-xxx
                </code>
                )
              </li>
              <li>
                The file is encrypted on the fly with a fresh AES‑256 key and
                uploaded to the secure backend
              </li>
            </ul>
          </div>
        </div>

        {/* Main content: Encryption wizard (file selection, policy definition, encryption) */}
        <div className="mb-8">
          <EncryptionWizard />
        </div>
      </div>
    </DashboardLayout>
  );
}
