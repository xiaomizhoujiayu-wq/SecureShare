import { useState,useEffect } from "react";
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
import { getMyAttributes } from "@/lib/api";
import axios from "axios";

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [expandedStep, setExpandedStep] = useState(1);
  const [IsEncrypting, setIsEncrypting] = useState(false);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [targetUid, setTargetUid]= useState<string>("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const steps: WizardStep[] = [
    { number: 1, title: "Select File", description: "Choose the file to encrypt" },
    { number: 2, title: "Define Access Policy", description: "Set who can access this file" },
    { number: 3, title: "Encrypt & Execute", description: "Complete the encryption process" },
  ];

  // const availableAttributes: Attribute[] = [
  //   { id: "dept-it", name: "IT", category: "Department", approved: true },
  //   { id: "dept-finance", name: "Finance", category: "Department", approved: true },
  //   { id: "role-manager", name: "Manager", category: "Role", approved: true },
  //   { id: "role-executive", name: "Executive", category: "Role", approved: true },
  //   { id: "team-security", name: "Security", category: "Team", approved: true },
  // ];

  useEffect(() => {
      const fetchIdentity = async () => {
        try {
          const data = await getMyAttributes();
          
          const rawAttrString = data.attributes || ""; 
          const attrArray = rawAttrString.trim() ? rawAttrString.split(',') : [];
  
  
          // 2. find attribute
          const businessAttributes = attrArray.filter((attr: string) => !attr.startsWith("ID:"));
  
          const parsedAttributes = businessAttributes.map((attrStr: string, index: number) => {
            const parts = attrStr.split(':');
            const category = parts.length > 1 ? parts[0] : "Role";
            //
            const value = parts.length > 1 ? parts.slice(1).join(':') : attrStr; 
            
            return {
              category: category,
              name: value,
            };
          });
  
          setAttributes(parsedAttributes);
        } catch (error) {
          console.error("Failed to load identity data", error);
        }
      };
  
      fetchIdentity();
    }, []);

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
    if (!selectedAttributes.find((a) => a.category === attr.category && a.name === attr.name)) {
      setSelectedAttributes([
        ...selectedAttributes,
        { id: attr.id, name: attr.name, category: attr.category },
      ]);
    }
  };

  const handleRemoveAttribute = (categoryToRemove: string, nameToRemove: string) => {
  setSelectedAttributes(
      selectedAttributes.filter(
        (a) => a.category !== categoryToRemove || a.name !== nameToRemove
      )
    );
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
    
    if (sharingMode === "private" && !targetUid) {
      alert("Please select a user");
      return;
    }

    let selectedTags = "";
    if (sharingMode === "group") {
        selectedTags = selectedAttributes.map((a) => `${a.category}:${a.name}`).join(",");
      } else {
        selectedTags = `ID:${targetUid}`; 
      }
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let rawKey = '';
    for (let i = 0; i < 16; i++) {
    rawKey += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    const base64Key = btoa(rawKey);
    setIsEncrypting(true);
    try {
        // 
        const fileBuffer = await selectedFile.arrayBuffer()
        // teansfer to bytes
        const encoder = new TextEncoder();
        const cryptoKey = await window.crypto.subtle.importKey(
                "raw",
                encoder.encode(rawKey), 
                { name: "AES-GCM" },
                false,
                ["encrypt"]
              );     
        // generate random IV
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        // ececute encryption
        const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        cryptoKey,
        fileBuffer
          );

        const combinedData = new Uint8Array(iv.length + encryptedBuffer.byteLength);
        combinedData.set(iv, 0); 
        combinedData.set(new Uint8Array(encryptedBuffer), iv.length);        
        
        // wrap into file object
        const encryptedFile = new File(
          [combinedData], 
          `${selectedFile.name}.enc`, 
          { type: "application/octet-stream" }
        );        

        await uploadAndEncryptFile(encryptedFile, selectedTags, base64Key);
        // trigger success info window
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

  return (
    <div className="rounded-xl p-4 sm:p-8 bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 shadow-sm dark:shadow-none transition-colors duration-300">
      <h2 className="font-display text-xl sm:text-2xl mb-6 sm:mb-8 text-slate-900 dark:text-white">Encryption Wizard</h2>

      {/* Step Indicator - Mobile Optimized */}
      <div className="flex items-center justify-between mb-6 sm:mb-8 gap-1 sm:gap-2">
        {steps.map((step, idx) => (
          <div key={step.number} className={`flex items-center ${idx < steps.length - 1 ? "flex-1" : ""}`}>
            <button
              onClick={() => {
                setExpandedStep(step.number);
                if (currentStep >= step.number) setCurrentStep(step.number);
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

      {/* Step Content - Accordion Style for Mobile */}
      <div className="space-y-3 sm:space-y-6">
        
        {/* Step 1: File Selection */}
        <div
          className={`rounded-lg border-2 transition-all overflow-hidden ${
            expandedStep === 1
              ? "border-emerald-500/50 bg-emerald-50 dark:bg-emerald-500/5"
              : "border-slate-200 bg-white dark:border-slate-700/50 dark:bg-slate-800/30"
          }`}
        >
          <button
            onClick={() => setExpandedStep(expandedStep === 1 ? 0 : 1)}
            className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors"
          >
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 text-slate-900 dark:text-white">
              <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center text-xs sm:text-sm font-semibold flex-shrink-0">
                1
              </span>
              <div className="text-left min-w-0">
                <p className="font-semibold text-sm sm:text-base">Select File</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Choose the file to encrypt</p>
              </div>
            </div>
            {expandedStep === 1 ? (
              <ChevronUp className="w-5 h-5 flex-shrink-0 text-slate-500 dark:text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 flex-shrink-0 text-slate-500 dark:text-slate-400" />
            )}
          </button>

          {expandedStep === 1 && (
            <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-700/50">
              {!fileName && (
                <label className="block">
                  <div className="border-2 border-dashed border-slate-300 dark:border-emerald-500/30 rounded-lg p-6 sm:p-8 text-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-colors bg-slate-50 dark:bg-transparent">
                    <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500 dark:text-emerald-400 mx-auto mb-2 sm:mb-3" />
                    <p className="font-semibold text-sm sm:text-base mb-1 text-slate-900 dark:text-white">Drag & drop or click</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">PDF • DOCX • PNG • JPG • ZIP</p>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </label>
              )}

              {fileName && (
                <div className="flex items-center justify-between p-3 sm:p-4 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50 shadow-sm dark:shadow-none">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-xs sm:text-sm truncate text-slate-900 dark:text-white">{fileName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Ready to encrypt</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFileName("")}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
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
                  <p className="font-semibold text-sm sm:text-base">Define Access Policy</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Set who can access this file</p>
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
                
                {/* Group Share Radio */}
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
                      <p className="font-semibold text-sm sm:text-base">Group Share</p>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Define policy using attributes.
                    </p>
                  </div>
                </label>

                {/* Private Share Radio */}
                <label className="flex items-start gap-3 p-3 sm:p-4 rounded-lg border-2 border-slate-200 bg-white dark:bg-transparent dark:border-slate-700/50 cursor-pointer hover:border-cyan-500/30 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <input
                    type="radio"
                    name="sharing"
                    value="private"
                    checked={sharingMode === "private"}
                    onChange={(e) => setSharingMode(e.target.value as "private")}
                    className="mt-1 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 text-slate-900 dark:text-white">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-500 dark:text-cyan-400 flex-shrink-0" />
                      <p className="font-semibold text-sm sm:text-base">Private Share</p>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Share directly with a specific user.
                    </p>
                  </div>
                </label>

                {/* Policy Builder */}
                {sharingMode === "group" && (
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50">
                    <p className="text-xs sm:text-sm font-semibold mb-3 text-slate-900 dark:text-white">Select Attributes:</p>
                    <div className="space-y-2 mb-3">
                      {attributes.map((attr) => (
                        <button
                          key={`${attr.category}:${attr.name}`}
                          onClick={() => handleAddAttribute(attr)}
                          disabled={selectedAttributes.some((a) => a.category === attr.category && a.name === attr.name)}
                          className="w-full flex items-center justify-between p-2 sm:p-3 rounded-lg border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent hover:border-emerald-500/30 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm text-slate-900 dark:text-white"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs text-slate-500 dark:text-slate-400">{attr.category}:</span>
                            <span className="font-semibold text-xs sm:text-sm">{attr.name}</span>
                          </div>
                          {selectedAttributes.some((a) => a.category === attr.category && a.name === attr.name) ? (
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                          ) : (
                            <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>

                    {selectedAttributes.length > 0 && (
                      <div className="p-2 sm:p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-200 dark:border-emerald-500/30">
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-2">Current Policy:</p>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          {selectedAttributes.map((attr) => (
                            <div
                              key={`${attr.category}:${attr.name}`}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs"
                            >
                              <span className="font-medium">{attr.name}</span>
                              <button
                                onClick={() => handleRemoveAttribute(attr.category,attr.name)}
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

                {/* User Search for Private Share */}
                {sharingMode === "private" && (
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50">
                    <p className="text-xs sm:text-sm font-semibold mb-3 text-slate-900 dark:text-white">Share to:</p>
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
                          autoComplete="new-password"
                          className="w-full pl-8 sm:pl-10 pr-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                    </div>
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
                  <p className="font-semibold text-sm sm:text-base">Encrypt & Execute</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Complete the encryption process</p>
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
                <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50">
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-2 sm:mb-3">Encryption Details:</p>
                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">File:</span>
                      <span className="font-mono text-cyan-600 dark:text-cyan-400 truncate ml-2">{fileName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Algorithm:</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400">AES</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Protection:</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400">ABE</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Mode:</span>
                      <span className="font-mono text-cyan-600 dark:text-cyan-400">
                        {sharingMode === "group" ? "Policy-Based" : "Direct UID"}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleEncrypt}
                  disabled={IsEncrypting}
                  className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold py-5 sm:py-6 rounded-lg transition-all hover:-translate-y-1 text-sm sm:text-base shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  {IsEncrypting ? "Encrypting..." : "Execute Encryption"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-emerald-500/30 rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl dark:shadow-emerald-500/10 text-center">
            
            {/* top logo */}
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-200 dark:border-emerald-500/20">
              <CheckCircle className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
            </div>
            
            {/* title & sub-title */}
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Encryption Complete</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
              Your file has been successfully encrypted. It is now safely stored.
            </p>
            
            {/* close button */}
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