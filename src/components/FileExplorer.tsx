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
// SecureFileExplorer.tsx - File explorer for viewing and downloading encrypted files
// ============================================================================

import { useSystemData } from "@/hooks/useFileLogic";
import { Download, FileText, Lock, Shield, Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteFile, downloadFile } from "@/lib/api";

// ----------------------------------------------------------------------------
// Type definitions
// ----------------------------------------------------------------------------

interface FileItem {
  id: string;
  name: string;
  ownerId: number;
  ownerName: string;
  uploadDate: string;
  policy: string;
  size: string;
  accessible: boolean;
  policyDetails: string;
}

// Helper to get current user ID from localStorage
const getUserId = () => localStorage.getItem("user_id") || "";

// ----------------------------------------------------------------------------
// Reusable table component for displaying files in both sections
// ----------------------------------------------------------------------------
const FileTable = ({
  files,
  isMyFiles,
  onDownload,
  onDelete,
}: {
  files: FileItem[];
  isMyFiles: boolean;
  onDownload: (file: FileItem) => void;
  onDelete: (id: string) => void;
}) => (
  <div className="hidden md:block overflow-x-auto bg-slate-50 dark:bg-slate-900/10 transition-colors duration-300">
    <table className="w-full table-fixed">
      <thead>
        <tr className="border-b border-slate-200 dark:border-slate-700/50 bg-slate-100 dark:bg-slate-900/50 transition-colors duration-300">
          <th className="w-[40%] px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">
            File Name
          </th>
          <th className="w-[25%] px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">
            Policy
          </th>
          <th className="w-[20%] px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">
            Accessibility
          </th>
          <th className="w-[15%] px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-300">
            Action
          </th>
        </tr>
      </thead>
      <tbody>
        {files.map((file) => (
          <tr
            key={file.id}
            className="border-b border-slate-200 dark:border-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors"
          >
            {/* File name and icon */}
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <FileText
                  className={`w-5 h-5 shrink-0 ${isMyFiles ? "text-emerald-600 dark:text-emerald-400" : "text-cyan-600 dark:text-cyan-400"}`}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-sm font-medium text-slate-900 dark:text-slate-200"
                    title={file.name}
                  >
                    {file.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {file.uploadDate}
                  </p>
                </div>
              </div>
            </td>
            {/* Policy display with shield icon */}
            <td className="px-6 py-4">
              <div
                className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 transition-colors"
                title={file.policyDetails}
              >
                <Shield
                  className={`w-3 h-3 ${file.accessible ? "text-emerald-500 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}`}
                />
                <span className="text-[11px] text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                  {file.policy}
                </span>
              </div>
            </td>
            {/* Accessibility status (accessible/locked) */}
            <td className="px-6 py-4">
              {file.accessible ? (
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />{" "}
                  accessible
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Lock className="w-3 h-3" /> locked
                </span>
              )}
            </td>
            {/* Action buttons (download + delete for own files) */}
            <td className="px-6 py-4 text-center">
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => onDownload(file)}
                  className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  title="Download"
                  aria-label="download"
                >
                  <Download className="w-4 h-4" />
                </button>
                {isMyFiles && (
                  <button
                    onClick={() => onDelete(file.id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ----------------------------------------------------------------------------
// Main SecureFileExplorer Component
// ----------------------------------------------------------------------------
export function SecureFileExplorer() {
  // Modal and toast states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | number | null>(
    null,
  );
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const userId = getUserId();

  // Get file lists and state setter from custom hook
  const { setAllFiles, sharedWithMeFiles, myUploadedFiles } =
    useSystemData(userId);

  // --------------------------------------------------------------------------
  // Delete handlers
  // --------------------------------------------------------------------------
  const handleDelete = async (fileId: string) => {
    setFileToDelete(fileId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;

    try {
      await deleteFile(fileToDelete);
      // Remove file from local state
      setAllFiles((prev) => prev.filter((f) => f.id !== fileToDelete));
      setIsDeleteModalOpen(false);
      setFileToDelete(null);
      setShowSuccessToast(true);
      // Auto-hide toast after 3 seconds
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 3000);
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete file");
    }
  };

  // --------------------------------------------------------------------------
  // Decryption utilities for downloaded files
  // --------------------------------------------------------------------------
  // Convert Base64 string to Uint8Array
  const base64ToBytes = (base64: string): Uint8Array<ArrayBuffer> => {
    const binary = atob(base64);
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  };

  // Convert Uint8Array to ArrayBuffer
  const toArrayBuffer = (data: Uint8Array<ArrayBuffer>): ArrayBuffer => {
    const buffer = new ArrayBuffer(data.byteLength);
    new Uint8Array(buffer).set(data);
    return buffer;
  };

  // Decrypt file using AES-GCM with the key from backend response header
  const decryptFrontendEncryptedFile = async (
    encryptedBuffer: ArrayBuffer,
    base64Key: string,
  ): Promise<ArrayBuffer> => {
    const encryptedBytes: Uint8Array<ArrayBuffer> = new Uint8Array(
      encryptedBuffer,
    );
    // First 12 bytes are the IV (initialization vector)
    const iv = encryptedBytes.slice(0, 12);
    // Remaining bytes are the ciphertext
    const ciphertext = encryptedBytes.slice(12);

    const rawKeyBytes = base64ToBytes(base64Key);
    const keyBuffer = toArrayBuffer(rawKeyBytes);
    const ivBuffer = toArrayBuffer(iv);
    const ciphertextBuffer = toArrayBuffer(ciphertext);

    // Import the raw key for AES-GCM
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBuffer,
      { name: "AES-GCM" },
      false,
      ["decrypt"],
    );

    // Perform decryption
    return await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: ivBuffer,
      },
      cryptoKey,
      ciphertextBuffer,
    );
  };

  // --------------------------------------------------------------------------
  // Download handler with frontend decryption
  // --------------------------------------------------------------------------
  const handleDownload = async (file: FileItem) => {
    try {
      // Request the encrypted file from backend
      const response = await downloadFile(file.id);

      // Backend returns the AES key in response header
      const sessionKeyBase64 = response.headers["x-session-key"];
      if (!sessionKeyBase64) {
        throw new Error("Missing X-Session-Key from backend response.");
      }

      // Get encrypted file data as ArrayBuffer
      const encryptedArrayBuffer = await response.data.arrayBuffer();

      // Decrypt the file using the key
      const decryptedBuffer = await decryptFrontendEncryptedFile(
        encryptedArrayBuffer,
        sessionKeyBase64,
      );

      // Create a downloadable blob and trigger download
      const blob = new Blob([decryptedBuffer]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      // Remove .enc extension if present
      link.download = file.name.endsWith(".enc")
        ? file.name.slice(0, -4)
        : file.name;

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Frontend decryption/download failed:", error);
      alert("Download or decryption failed. Please check console for details.");
    }
  };

  // --------------------------------------------------------------------------
  // Render JSX
  // --------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* SECTION 1: Shared With Me (Files others shared with me) */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-slate-800 dark:text-slate-200">
          Shared With Me
        </h2>
        <FileTable
          files={sharedWithMeFiles}
          isMyFiles={false}
          onDownload={handleDownload}
          onDelete={handleDelete}
        />
      </div>

      {/* SECTION 2: My Shared Files (Files I uploaded) */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-slate-800 dark:text-slate-200">
          My Uploaded Files
        </h2>
        <FileTable
          files={myUploadedFiles}
          isMyFiles={true}
          onDownload={handleDownload}
          onDelete={handleDelete}
        />
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden transform transition-all border border-slate-200 dark:border-slate-700">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-100 dark:bg-red-500/10 rounded-full text-red-600">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Delete File
                </h3>
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                Are you sure you want to delete this file?
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast Notification */}
      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] transition-all duration-500 transform ${showSuccessToast ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0 pointer-events-none"}`}
      >
        <div className="bg-emerald-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
          <div className="bg-white/20 rounded-full p-1">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <span className="font-medium">File deleted successfully!</span>
        </div>
      </div>
    </div>
  );
}
