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
// EncryptionWizard.tsx - Multi-step wizard for file encryption and policy definition
// ============================================================================

import { Button } from "@/components/ui/button";
import { getMyAttributes } from "@/lib/api";
import { encryptAndUpload } from "@/utils/encryptionService";
import axios from "axios";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Plus,
  Search,
  Upload,
  User,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState, type ChangeEvent } from "react";

// ----------------------------------------------------------------------------
// Type definitions
// ----------------------------------------------------------------------------

// Represents an attribute selected by the user for the access policy
export interface SelectedAttribute {
  id: string;
  name: string;
  category: string;
  rawTag: string; // Original backend attribute string (e.g., "level:3", "dep")
}

// Step definition for the wizard
interface WizardStep {
  number: number;
  title: string;
  description: string;
}

// Attribute from the user's own identity (available to select for policy)
interface Attribute {
  id: string;
  name: string;
  category: string;
  approved: boolean;
  rawTag: string;
}

// ----------------------------------------------------------------------------
// Main EncryptionWizard component
// ----------------------------------------------------------------------------
export function EncryptionWizard({
  initialSelectedAttributes = [],
}: {
  initialSelectedAttributes?: SelectedAttribute[];
}) {
  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [fileName, setFileName] = useState<string>("");
  const [sharingMode, setSharingMode] = useState<"group" | "private">("group");
  const [selectedAttributes, setSelectedAttributes] = useState<
    SelectedAttribute[]
  >(initialSelectedAttributes);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [expandedStep, setExpandedStep] = useState(1);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [targetUid, setTargetUid] = useState<string>("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Wizard step definitions
  const steps: WizardStep[] = [
    {
      number: 1,
      title: "Select File",
      description: "Choose the file to encrypt",
    },
    {
      number: 2,
      title: "Define Access Policy",
      description: "Set who can access this file",
    },
    {
      number: 3,
      title: "Encrypt & Execute",
      description: "Complete the encryption process",
    },
  ];

  // --------------------------------------------------------------------------
  // Load user's own attributes (identity) on mount
  // --------------------------------------------------------------------------
  useEffect(() => {
    const fetchIdentity = async () => {
      try {
        const data = await getMyAttributes();

        const rawAttrString = data.attributes || "";

        // Parse comma-separated attributes and trim each
        const attrArray = rawAttrString.trim()
          ? rawAttrString
              .split(",")
              .map((attr: string) => attr.trim())
              .filter(Boolean)
          : [];

        // Remove private ID attribute (ID:xxx) from group-share selectable attributes
        const businessAttributes = attrArray.filter(
          (attr: string) => !attr.startsWith("ID:"),
        );

        // Convert each attribute string to an Attribute object
        const parsedAttributes: Attribute[] = businessAttributes.map(
          (attrStr: string, index: number) => {
            const parts = attrStr.split(":");
            const hasCategory = parts.length > 1;

            const category = hasCategory ? parts[0] : "";
            const value = hasCategory ? parts.slice(1).join(":") : attrStr;

            return {
              id: `${attrStr}:${index}`,
              category,
              name: value,
              approved: true,
              rawTag: attrStr, // Keep the original backend attribute exactly
            };
          },
        );

        setAttributes(parsedAttributes);
      } catch (error) {
        console.error("Failed to load identity data", error);
      }
    };

    fetchIdentity();
  }, []);

  // Helper: convert Uint8Array to Base64 string
  const bytesToBase64 = (bytes: Uint8Array): string => {
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary);
  };

  // Handle file selection from input
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setSelectedFile(file);
      setCurrentStep(2);
      setExpandedStep(2);
    }
  };

  // Clear selected file and reset wizard
  const handleClearFile = () => {
    setFileName("");
    setSelectedFile(null);
    setCurrentStep(1);
    setExpandedStep(1);
    setSelectedAttributes([]);
    setTargetUid("");
  };

  // Add an attribute to the current policy (group share mode)
  const handleAddAttribute = (attr: Attribute) => {
    const alreadySelected = selectedAttributes.some(
      (a) => a.rawTag === attr.rawTag,
    );
    if (!alreadySelected) {
      setSelectedAttributes([
        ...selectedAttributes,
        {
          id: attr.id,
          name: attr.name,
          category: attr.category,
          rawTag: attr.rawTag,
        },
      ]);
      setCurrentStep(3);
      setExpandedStep(3);
    }
  };

  // Remove an attribute from the current policy
  const handleRemoveAttribute = (rawTagToRemove: string) => {
    setSelectedAttributes(
      selectedAttributes.filter((a) => a.rawTag !== rawTagToRemove),
    );
  };

  // Core encryption and upload logic
  const handleEncrypt = async () => {
    // Validation: file must be selected
    if (!fileName) {
      alert("Please select a file");
      return;
    }
    if (!selectedFile) {
      alert("Please select a file");
      return;
    }

    // Group share requires at least one attribute
    if (sharingMode === "group" && selectedAttributes.length === 0) {
      alert("Please select at least one attribute");
      return;
    }

    // Private share requires a target UID
    if (sharingMode === "private" && !targetUid) {
      alert("Please select a user");
      return;
    }

    // Build the policy string (selectedTags) from selected attributes or UID
    let selectedTags = "";

    if (sharingMode === "group") {
      const expandedTags = new Set<string>();
      selectedAttributes.forEach((a) => {
        const tag = a.rawTag;
        if (tag.toLowerCase().startsWith("level:")) {
          // For level attributes, add the original tag (without expanding)
          expandedTags.add(tag);
        } else {
          // For non-level attributes, add directly
          expandedTags.add(tag);
        }
      });
      selectedTags = Array.from(expandedTags).join(",");
    } else if (sharingMode === "private") {
      selectedTags = `ID:${targetUid}`;
    }

    // Debug logs (kept as original)
    console.log("=== DEBUG START ===");
    console.log("selectedAttributes length:", selectedAttributes.length);
    selectedAttributes.forEach((a, idx) => {
      console.log(`attr ${idx}:`, a);
      console.log(`rawTag type:`, typeof a.rawTag, "value:", a.rawTag);
    });
    console.log("Selected tags sent to backend:", selectedTags);
    console.log("sharingMode:", sharingMode);
    console.log("selectedAttributes:", selectedAttributes);
    console.log("targetUid:", targetUid);
    console.log("selectedTags final:", selectedTags);
    console.log("=== DEBUG END ===");

    // Generate a cryptographically random 32-byte AES-256 key
    const rawKeyBytes = new Uint8Array(32);
    window.crypto.getRandomValues(rawKeyBytes);

    // Backend expects the key in Base64 format
    const base64Key = bytesToBase64(rawKeyBytes);

    console.log("Raw AES key byte length:", rawKeyBytes.length);
    console.log("Base64 key sent to backend:", base64Key);

    setIsEncrypting(true);

    try {
      // Perform encryption and upload
      await encryptAndUpload(selectedFile, selectedTags);

      // Show success modal and reset wizard state
      setShowSuccessModal(true);
      setCurrentStep(1);
      setSelectedFile(null);
      setFileName("");
      setSharingMode("group");
      setSelectedAttributes([]);
      setExpandedStep(1);
      setTargetUid("");
    } catch (error) {
      console.error("Encryption/Upload failed:", error);
      if (axios.isAxiosError(error)) {
        console.log("Backend error details:", error.response?.data);
      }
      alert("Upload failed. Check console for details.");
    } finally {
      setIsEncrypting(false);
    }
  };

  // --------------------------------------------------------------------------
  // Render JSX
  // --------------------------------------------------------------------------
  return (
    <div className="rounded-2xl p-4 sm:p-8 bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border border-white/60 dark:border-slate-700/50 shadow-xl shadow-slate-200/40 dark:shadow-none transition-all duration-300">
      {/* Wizard header */}
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <h2 className="font-display text-xl sm:text-2xl font-semibold text-slate-800 dark:text-white">
          Encryption Wizard
        </h2>
      </div>

      {/* Step indicator (progress bar) */}
      <div className="flex items-center justify-between mb-6 sm:mb-8 gap-1 sm:gap-2">
        {steps.map((step, idx) => (
          <div
            key={step.number}
            className={`flex items-center ${
              idx < steps.length - 1 ? "flex-1" : ""
            }`}
          >
            {/* Step circle button */}
            <button
              onClick={() => {
                setExpandedStep(step.number);
                if (currentStep >= step.number) {
                  setCurrentStep(step.number);
                }
              }}
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold transition-all flex-shrink-0 ${
                currentStep >= step.number
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-md"
                  : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
              }`}
            >
              {currentStep > step.number ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <span className="text-sm">{step.number}</span>
              )}
            </button>
            {/* Connector line between steps */}
            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-1 sm:mx-2 rounded-full ${
                  currentStep > step.number
                    ? "bg-gradient-to-r from-emerald-500 to-cyan-500"
                    : "bg-slate-200 dark:bg-slate-700/50"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="space-y-3 sm:space-y-6">
        {/* ---------- Step 1: File Selection ---------- */}
        <div
          data-testid="step-select-file"
          className={`rounded-lg border-2 transition-all overflow-hidden ${
            expandedStep === 1
              ? "border-emerald-500/50 bg-emerald-50 dark:bg-emerald-500/5"
              : "border-slate-200 bg-white dark:border-slate-700/50 dark:bg-slate-800/30"
          }`}
        >
          {/* Step header (clickable to expand/collapse) */}
          <button
            onClick={() => setExpandedStep(expandedStep === 1 ? 0 : 1)}
            className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors"
          >
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 text-slate-900 dark:text-white">
              <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center text-xs sm:text-sm font-semibold flex-shrink-0">
                1
              </span>
              <div className="text-left min-w-0">
                <p className="font-semibold text-sm sm:text-base">
                  Select File
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                  Choose the file to encrypt
                </p>
              </div>
            </div>
            {expandedStep === 1 ? (
              <ChevronUp className="w-5 h-5 flex-shrink-0 text-slate-500 dark:text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 flex-shrink-0 text-slate-500 dark:text-slate-400" />
            )}
          </button>

          {/* Step 1 content (file upload area) */}
          {expandedStep === 1 && (
            <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-700/50">
              {!fileName ? (
                // File upload drop zone
                <label className="relative flex flex-col items-center justify-center w-full px-6 py-12 sm:py-16 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/10 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all duration-300 ease-out group cursor-pointer overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-50/50 dark:to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  <div className="p-4 rounded-full mb-4 bg-white dark:bg-slate-700 shadow-sm text-slate-400 dark:text-slate-300 group-hover:text-emerald-500 group-hover:scale-110 group-hover:shadow-md transition-all duration-300 z-10">
                    <Upload
                      className="w-8 h-8 sm:w-10 sm:h-10"
                      strokeWidth={1.5}
                    />
                  </div>
                  <p className="font-semibold text-sm sm:text-base mb-2 text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors z-10">
                    Drag & Drop or Click to Browse
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs text-center z-10">
                    PDF • DOCX • PNG • JPG • ZIP
                  </p>
                  <input
                    type="file"
                    aria-label="Choose File"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              ) : (
                // Selected file info
                <div className="flex items-center justify-between p-3 sm:p-4 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50 shadow-sm dark:shadow-none">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-xs sm:text-sm truncate text-slate-900 dark:text-white">
                        {fileName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Ready to encrypt
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClearFile}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ---------- Step 2: Define Access Policy ---------- */}
        {fileName && (
          <div
            data-testid="step-policy"
            className={`rounded-lg border-2 transition-all overflow-hidden ${
              expandedStep === 2
                ? "border-emerald-500/50 bg-emerald-50 dark:bg-emerald-500/5"
                : "border-slate-200 bg-white dark:border-slate-700/50 dark:bg-slate-800/30"
            }`}
          >
            <button
              onClick={() => setExpandedStep(expandedStep === 2 ? 0 : 2)}
              className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors"
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 text-slate-900 dark:text-white">
                <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center text-xs sm:text-sm font-semibold flex-shrink-0">
                  2
                </span>
                <div className="text-left min-w-0">
                  <p className="font-semibold text-sm sm:text-base">
                    Define Access Policy
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                    Set who can access this file
                  </p>
                </div>
              </div>
              {expandedStep === 2 ? (
                <ChevronUp className="w-5 h-5 flex-shrink-0 text-slate-500 dark:text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 flex-shrink-0 text-slate-500 dark:text-slate-400" />
              )}
            </button>

            {expandedStep === 2 && (
              <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-700/50 space-y-3 sm:space-y-4">
                {/* Group Share radio option */}
                <label className="flex items-start gap-3 p-3 sm:p-4 rounded-lg border-2 border-slate-200 bg-white dark:bg-transparent dark:border-slate-700/50 cursor-pointer hover:border-emerald-500/30 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <input
                    type="radio"
                    name="sharing"
                    value="group"
                    checked={sharingMode === "group"}
                    onChange={(e) => setSharingMode(e.target.value as "group")}
                    className="mt-1 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 text-slate-900 dark:text-white">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                      <p className="font-semibold text-sm sm:text-base">
                        Group Share
                      </p>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Define policy using attributes.
                    </p>
                  </div>
                </label>

                {/* Private Share radio option */}
                <label className="flex items-start gap-3 p-3 sm:p-4 rounded-lg border-2 border-slate-200 bg-white dark:bg-transparent dark:border-slate-700/50 cursor-pointer hover:border-cyan-500/30 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <input
                    type="radio"
                    name="sharing"
                    value="private"
                    checked={sharingMode === "private"}
                    onChange={(e) =>
                      setSharingMode(e.target.value as "private")
                    }
                    className="mt-1 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 text-slate-900 dark:text-white">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-500 dark:text-cyan-400 flex-shrink-0" />
                      <p className="font-semibold text-sm sm:text-base">
                        Private Share
                      </p>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Share directly with a specific user.
                    </p>
                  </div>
                </label>

                {/* Policy Builder (only for Group Share) */}
                {sharingMode === "group" && (
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50">
                    <p className="text-xs sm:text-sm font-semibold mb-3 text-slate-900 dark:text-white">
                      Select Attributes:
                    </p>
                    {/* List of available attributes from user's identity */}
                    <div className="space-y-2 mb-3">
                      {attributes.map((attr) => {
                        const isSelected = selectedAttributes.some(
                          (a) => a.rawTag === attr.rawTag,
                        );
                        return (
                          <button
                            key={attr.id}
                            onClick={() => handleAddAttribute(attr)}
                            disabled={isSelected}
                            className="w-full flex items-center justify-between p-2 sm:p-3 rounded-lg border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent hover:border-emerald-500/30 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm text-slate-900 dark:text-white"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {attr.category && (
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  {attr.category}:
                                </span>
                              )}
                              <span className="font-semibold text-xs sm:text-sm">
                                {attr.name}
                              </span>
                            </div>
                            {isSelected ? (
                              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                            ) : (
                              <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Display currently selected policy tags */}
                    {selectedAttributes.length > 0 && (
                      <div
                        data-testid="selected-tags"
                        className="p-2 sm:p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-200 dark:border-emerald-500/30"
                      >
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-2">
                          Current Policy:
                        </p>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          {selectedAttributes.map((attr) => (
                            <div
                              key={attr.id}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs"
                            >
                              <span className="font-medium">{attr.rawTag}</span>
                              <button
                                onClick={() =>
                                  handleRemoveAttribute(attr.rawTag)
                                }
                                className="hover:text-red-500 dark:hover:text-red-400 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Private Share: Target UID input */}
                {sharingMode === "private" && (
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50">
                    <p className="text-xs sm:text-sm font-semibold mb-3 text-slate-900 dark:text-white">
                      Share to:
                    </p>
                    <div className="flex gap-2 mb-3">
                      <div className="flex-1 relative">
                        <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Please enter target user's uid here..."
                          value={targetUid}
                          onChange={(e) => {
                            let val = e.target.value.trim();
                            if (val.toUpperCase().startsWith("ID:")) {
                              val = val.substring(3).trim();
                            }
                            setTargetUid(val);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && targetUid) {
                              setCurrentStep(3);
                              setExpandedStep(3);
                            }
                          }}
                          autoComplete="new-password"
                          className="w-full pl-8 sm:pl-10 pr-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <button
                        onClick={() => {
                          if (targetUid) {
                            setCurrentStep(3);
                            setExpandedStep(3);
                          }
                        }}
                        className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-xs font-semibold hover:bg-emerald-600 transition-colors"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ---------- Step 3: Encrypt & Execute ---------- */}
        {fileName && (
          <div
            data-testid="step-encrypt"
            className={`rounded-lg border-2 transition-all overflow-hidden ${
              expandedStep === 3
                ? "border-emerald-500/50 bg-emerald-50 dark:bg-emerald-500/5"
                : "border-slate-200 bg-white dark:border-slate-700/50 dark:bg-slate-800/30"
            }`}
          >
            <button
              onClick={() => setExpandedStep(expandedStep === 3 ? 0 : 3)}
              className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors"
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 text-slate-900 dark:text-white">
                <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center text-xs sm:text-sm font-semibold flex-shrink-0">
                  3
                </span>
                <div className="text-left min-w-0">
                  <p className="font-semibold text-sm sm:text-base">
                    Encrypt & Execute
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                    Complete the encryption process
                  </p>
                </div>
              </div>
              {expandedStep === 3 ? (
                <ChevronUp className="w-5 h-5 flex-shrink-0 text-slate-500 dark:text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 flex-shrink-0 text-slate-500 dark:text-slate-400" />
              )}
            </button>

            {expandedStep === 3 && (
              <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-700/50 space-y-3 sm:space-y-4">
                {/* Encryption details summary */}
                <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50">
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-2 sm:mb-3">
                    Encryption Details:
                  </p>
                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">
                        File:
                      </span>
                      <span className="font-mono text-cyan-600 dark:text-cyan-400 truncate ml-2">
                        {fileName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">
                        Algorithm:
                      </span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400">
                        AES
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">
                        Protection:
                      </span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400">
                        ABE
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">
                        Mode:
                      </span>
                      <span className="font-mono text-cyan-600 dark:text-cyan-400">
                        {sharingMode === "group"
                          ? "Policy-Based"
                          : "Direct UID"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Execute encryption button */}
                <Button
                  onClick={handleEncrypt}
                  data-testid="encrypt-btn"
                  disabled={isEncrypting}
                  className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold py-5 sm:py-6 rounded-lg transition-all hover:-translate-y-1 text-sm sm:text-base shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  {isEncrypting ? "Encrypting..." : "Execute Encryption"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ---------- Success Modal ---------- */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-emerald-500/30 rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl dark:shadow-emerald-500/10 text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-200 dark:border-emerald-500/20">
              <CheckCircle className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Encryption Complete
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
              Your file has been successfully encrypted. It is now safely
              stored.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/50 font-semibold py-2.5 rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
