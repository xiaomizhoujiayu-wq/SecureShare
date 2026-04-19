import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Users,
  User,
  Plus,
  X,
  Lock,
  CheckCircle,
  Search,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import{uploadAndEncryptFile} from '@/lib/api'

interface WizardStep {
  number: number;
  title: string;
  description: string;
}

interface Attribute {
  id: string;
  name: string;
  category: string;
  approved: boolean;
}

interface SelectedAttribute {
  id: string;
  name: string;
  category: string;
}

export function EncryptionWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [fileName, setFileName] = useState<string>("");
  const [sharingMode, setSharingMode] = useState<"group" | "private">("group");
  const [selectedAttributes, setSelectedAttributes] = useState<SelectedAttribute[]>([]);
  const [searchUser, setSearchUser] = useState("");
  const [foundUser, setFoundUser] = useState<{ uid: string; name: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [expandedStep, setExpandedStep] = useState(1);
  const [IsEncrypting, setIsEncrypting] = useState(false);
  

  const steps: WizardStep[] = [
    { number: 1, title: "Select File", description: "Choose the file to encrypt" },
    { number: 2, title: "Define Access Policy", description: "Set who can access this file" },
    { number: 3, title: "Encrypt & Execute", description: "Complete the encryption process" },
  ];

  const availableAttributes: Attribute[] = [
    { id: "dept-it", name: "IT", category: "Department", approved: true },
    { id: "dept-finance", name: "Finance", category: "Department", approved: true },
    { id: "role-manager", name: "Manager", category: "Role", approved: true },
    { id: "role-executive", name: "Executive", category: "Role", approved: true },
    { id: "team-security", name: "Security", category: "Team", approved: true },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setSelectedFile(file);
      setCurrentStep(2);
      setExpandedStep(2);
    }
  };

  const handleAddAttribute = (attr: Attribute) => {
    if (!selectedAttributes.find((a) => a.id === attr.id)) {
      setSelectedAttributes([
        ...selectedAttributes,
        { id: attr.id, name: attr.name, category: attr.category },
      ]);
    }
  };

  const handleRemoveAttribute = (attrId: string) => {
    setSelectedAttributes(selectedAttributes.filter((a) => a.id !== attrId));
  };

  const handleSearchUser = () => {
    if (searchUser.trim()) {
      setFoundUser({
        uid: `user_${searchUser.toLowerCase().replace(/\s+/g, "_")}`,
        name: searchUser,
      });
    }
  };

  const handleEncrypt = async () => {
    if (!fileName) {
      alert("Please select a file");
      return;
    }
    if (!selectedFile) {
      alert("Please select a file");
      return;
    }   
    if (sharingMode === "group" && selectedAttributes.length === 0) {
      alert("Please select at least one attribute");
      return;
    }
    
    if (sharingMode === "private" && !foundUser) {
      alert("Please search and select a user");
      return;
    }

    let selectedTags = "";
    if (sharingMode === "group") {
        selectedTags = selectedAttributes.map((a) => `${a.category}:${a.name}`).join(",");
      } else {
        selectedTags = `ID:${foundUser?.uid}`; 
      }
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let rawKey = '';
    for (let i = 0; i < 32; i++) {
    rawKey += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    const base64Key = btoa(rawKey);
    setIsEncrypting(true);
    try {
        // 
        console.log("file:", selectedFile);
        console.log("policy:", selectedTags);
        console.log("key:", base64Key);
        await uploadAndEncryptFile(selectedFile, selectedTags, base64Key);
        alert("File Encrypted and Uploaded Successfully! ");
    
        setCurrentStep(1);
        setSelectedFile(null);
        setFileName(""); 
        setSharingMode("group");
        setSelectedAttributes([]);
        setSearchUser("");
        setFoundUser(null);
        setExpandedStep(1);

      } catch (error) {
        console.error("Encryption/Upload failed:", error);
        alert("Upload failed. Check console for details.");
      } finally {
        setIsEncrypting(false);
      }            
  };

  return (
    <div className="glass rounded-xl p-4 sm:p-8 border border-slate-700/50">
      <h2 className="font-display text-xl sm:text-2xl mb-6 sm:mb-8">Encryption Wizard</h2>

      {/* Step Indicator - Mobile Optimized */}
      <div className="flex items-center justify-between mb-6 sm:mb-8 gap-1 sm:gap-2">
        {steps.map((step, idx) => (
          <div key={step.number} className="flex items-center flex-1 min-w-0">
            <button
              onClick={() => {
                setExpandedStep(step.number);
                if (currentStep >= step.number) setCurrentStep(step.number);
              }}
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold transition-all flex-shrink-0 ${
                currentStep >= step.number
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white"
                  : "bg-slate-700/50 text-slate-400"
              }`}
            >
              {currentStep > step.number ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <span className="text-sm">{step.number}</span>
              )}
            </button>
            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-1 sm:mx-2 rounded-full ${
                  currentStep > step.number
                    ? "bg-gradient-to-r from-emerald-500 to-cyan-500"
                    : "bg-slate-700/50"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content - Accordion Style for Mobile */}
      <div className="space-y-3 sm:space-y-6">
        {/* Step 1: File Selection */}
        <div
          className={`rounded-lg border-2 transition-all overflow-hidden ${
            expandedStep === 1
              ? "border-emerald-500/50 bg-emerald-500/5"
              : "border-slate-700/50 bg-slate-800/30"
          }`}
        >
          <button
            onClick={() => setExpandedStep(expandedStep === 1 ? 0 : 1)}
            className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-slate-700/20 transition-colors"
          >
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs sm:text-sm font-semibold flex-shrink-0">
                1
              </span>
              <div className="text-left min-w-0">
                <p className="font-semibold text-sm sm:text-base">Select File</p>
                <p className="text-xs text-slate-400 hidden sm:block">Choose the file to encrypt</p>
              </div>
            </div>
            {expandedStep === 1 ? (
              <ChevronUp className="w-5 h-5 flex-shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 flex-shrink-0" />
            )}
          </button>

          {expandedStep === 1 && (
            <div className="p-3 sm:p-4 border-t border-slate-700/50">
              {!fileName && (
                <label className="block">
                  <div className="border-2 border-dashed border-emerald-500/30 rounded-lg p-6 sm:p-8 text-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-colors">
                    <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400 mx-auto mb-2 sm:mb-3" />
                    <p className="font-semibold text-sm sm:text-base mb-1">Drag & drop or click</p>
                    <p className="text-xs text-slate-400">PDF • DOCX • PNG • JPG • ZIP</p>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </label>
              )}

              {fileName && (
                <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-xs sm:text-sm truncate">{fileName}</p>
                      <p className="text-xs text-slate-400">Ready to encrypt</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFileName("")}
                    className="p-1 hover:bg-slate-700/50 rounded transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 2: Define Access Policy */}
        {fileName && (
          <div
            className={`rounded-lg border-2 transition-all overflow-hidden ${
              expandedStep === 2
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-slate-700/50 bg-slate-800/30"
            }`}
          >
            <button
              onClick={() => setExpandedStep(expandedStep === 2 ? 0 : 2)}
              className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-slate-700/20 transition-colors"
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs sm:text-sm font-semibold flex-shrink-0">
                  2
                </span>
                <div className="text-left min-w-0">
                  <p className="font-semibold text-sm sm:text-base">Define Access Policy</p>
                  <p className="text-xs text-slate-400 hidden sm:block">Set who can access this file</p>
                </div>
              </div>
              {expandedStep === 2 ? (
                <ChevronUp className="w-5 h-5 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 flex-shrink-0" />
              )}
            </button>

            {expandedStep === 2 && (
              <div className="p-3 sm:p-4 border-t border-slate-700/50 space-y-3 sm:space-y-4">
                {/* Group Share */}
                <label className="flex items-start gap-3 p-3 sm:p-4 rounded-lg border-2 border-slate-700/50 cursor-pointer hover:border-emerald-500/30 hover:bg-slate-800/30 transition-colors">
                  <input
                    type="radio"
                    name="sharing"
                    value="group"
                    checked={sharingMode === "group"}
                    onChange={(e) => setSharingMode(e.target.value as "group")}
                    className="mt-1 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                      <p className="font-semibold text-sm sm:text-base">Group Share</p>
                    </div>
                    <p className="text-xs text-slate-400">
                      Define policy using attributes.
                    </p>
                  </div>
                </label>

                {/* Private Share */}
                <label className="flex items-start gap-3 p-3 sm:p-4 rounded-lg border-2 border-slate-700/50 cursor-pointer hover:border-cyan-500/30 hover:bg-slate-800/30 transition-colors">
                  <input
                    type="radio"
                    name="sharing"
                    value="private"
                    checked={sharingMode === "private"}
                    onChange={(e) => setSharingMode(e.target.value as "private")}
                    className="mt-1 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 flex-shrink-0" />
                      <p className="font-semibold text-sm sm:text-base">Private Share</p>
                    </div>
                    <p className="text-xs text-slate-400">
                      Share directly with a specific user.
                    </p>
                  </div>
                </label>

                {/* Policy Builder */}
                {sharingMode === "group" && (
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <p className="text-xs sm:text-sm font-semibold mb-3">Select Attributes:</p>
                    <div className="space-y-2 mb-3">
                      {availableAttributes.map((attr) => (
                        <button
                          key={attr.id}
                          onClick={() => handleAddAttribute(attr)}
                          disabled={selectedAttributes.some((a) => a.id === attr.id)}
                          className="w-full flex items-center justify-between p-2 sm:p-3 rounded-lg border border-slate-700/50 hover:border-emerald-500/30 hover:bg-slate-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs text-slate-400">{attr.category}:</span>
                            <span className="font-semibold text-xs sm:text-sm">{attr.name}</span>
                          </div>
                          {selectedAttributes.some((a) => a.id === attr.id) ? (
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>

                    {selectedAttributes.length > 0 && (
                      <div className="p-2 sm:p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                        <p className="text-xs text-emerald-400 mb-2">Current Policy:</p>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          {selectedAttributes.map((attr) => (
                            <div
                              key={attr.id}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-xs"
                            >
                              <span className="font-medium">{attr.name}</span>
                              <button
                                onClick={() => handleRemoveAttribute(attr.id)}
                                className="hover:text-red-400 transition-colors"
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

                {/* User Search for Private Share */}
                {sharingMode === "private" && (
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <p className="text-xs sm:text-sm font-semibold mb-3">Find User:</p>
                    <div className="flex gap-2 mb-3">
                      <div className="flex-1 relative">
                        <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search by name..."
                          value={searchUser}
                          onChange={(e) => setSearchUser(e.target.value)}
                          className="w-full pl-8 sm:pl-10 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-700/50 text-xs sm:text-sm focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <button
                        onClick={handleSearchUser}
                        className="px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors text-xs sm:text-sm font-medium flex-shrink-0"
                      >
                        Search
                      </button>
                    </div>

                    {foundUser && (
                      <div className="p-2 sm:p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-emerald-300">
                              {foundUser.name}
                            </p>
                            <p className="text-xs text-emerald-300/70 font-mono truncate">
                              {foundUser.uid}
                            </p>
                          </div>
                          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Encrypt & Execute */}
        {fileName && (
          <div
            className={`rounded-lg border-2 transition-all overflow-hidden ${
              expandedStep === 3
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-slate-700/50 bg-slate-800/30"
            }`}
          >
            <button
              onClick={() => setExpandedStep(expandedStep === 3 ? 0 : 3)}
              className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-slate-700/20 transition-colors"
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs sm:text-sm font-semibold flex-shrink-0">
                  3
                </span>
                <div className="text-left min-w-0">
                  <p className="font-semibold text-sm sm:text-base">Encrypt & Execute</p>
                  <p className="text-xs text-slate-400 hidden sm:block">Complete the encryption process</p>
                </div>
              </div>
              {expandedStep === 3 ? (
                <ChevronUp className="w-5 h-5 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 flex-shrink-0" />
              )}
            </button>

            {expandedStep === 3 && (
              <div className="p-3 sm:p-4 border-t border-slate-700/50 space-y-3 sm:space-y-4">
                <div className="p-3 sm:p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <p className="text-xs sm:text-sm text-slate-400 mb-2 sm:mb-3">Encryption Details:</p>
                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">File:</span>
                      <span className="font-mono text-cyan-400 truncate ml-2">{fileName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Algorithm:</span>
                      <span className="font-mono text-emerald-400">AES-256</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Protection:</span>
                      <span className="font-mono text-emerald-400">CP-ABE</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Mode:</span>
                      <span className="font-mono text-cyan-400">
                        {sharingMode === "group" ? "Policy-Based" : "Direct UID"}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleEncrypt}
                  className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold py-5 sm:py-6 rounded-lg transition-smooth hover-lift text-sm sm:text-base"
                >
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Execute Encryption
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}