import { useState, useEffect, useMemo } from "react";
import { 
  FileText, Shield, Lock, Download, Share2, 
  AlertCircle, ChevronDown, FolderDown, Loader2, Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
// import { getMyAttributes, getAllFiles } from "@/lib/api";
import { getMyAttributes, getAllFiles, downloadFile, deleteFile } from "@/lib/api";

interface BackendFileResponse {
  id: number;
  owner_id: number;
  filename: string;     
  upload_time: string;  
  policy: string;       
  accessible?: boolean;
}

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

export function SecureFileExplorer() {
  const [allFiles, setAllFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | number | null>(null);
  const [expandedFile, setExpandedFile] = useState<string | null>(null);
  const [expandedMyFile, setExpandedMyFile] = useState<string | null>(null);

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        const attrData = await getMyAttributes();
        const rawAttrString = attrData.attributes || ""; 
        const attrArray = rawAttrString.trim() ? rawAttrString.split(',') : [];
        const idAttribute = attrArray.find((attr: string) => attr.startsWith("ID:"));
        
        const myId = idAttribute ? idAttribute.substring(3) : attrData.userId;
        setCurrentUserId(myId);

        const rawFiles: BackendFileResponse[] = await getAllFiles(); 
        console.log("rawFiles:", rawFiles);
        const formattedFiles: FileItem[] = rawFiles.map((item: any) => {
          const isPrivate = item.policy && item.policy.startsWith("ID:");
          
          return {
            id: String(item.id),
            name: item.filename,                  
            ownerId: item.ownerId,
            ownerName: `User ${item.ownerId}`,   
            uploadDate: item.uploadTime 
              ? new Date(item.uploadTime).toLocaleDateString() 
              : "Unknown time", 
            policy: isPrivate ? "Private Access" : (item.policy || "Public"), 
            size: "-- MB",
            accessible: item.accessible ?? true, 
            policyDetails: item.policy || "No details provided"      
          };
        });

        setAllFiles(formattedFiles);
      } catch (error) {
        console.error("loading fail:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initData();
  }, []);

    // 
    const rawPolicy = file.policyDetails; 
    
    // 
    let policyArray: string[] = [];
    if (typeof rawPolicy === "string" && rawPolicy !== "No details provided") {
        policyArray = rawPolicy.split(",");
    } else if (Array.isArray(rawPolicy)) {
        policyArray = rawPolicy;
    }

    // 2. level base 
    const levelTags = policyArray.filter(p => p.toLowerCase().startsWith("level:"));
    let hasLevelAccess = false;
    if (levelTags.length>0) {
    //allow levels
    const allowedLevels = levelTags.map(tag => parseInt(tag.split(":")[1], 10)).filter(num => !isNaN(num));
    if (allowedLevels.length > 0) {
            const maxRequiredLevel = Math.max(...allowedLevels);            
            hasLevelAccess = myLevel <= maxRequiredLevel;
          }    
        }

    // 3. private share 
    const isDirectlySharedWithMe = policyArray.includes(`ID:${userUID}`);

    // 4. attribute base 
    const hasAttributeMatch = policyArray.some(p => myAttributes.includes(p));

    return isDirectlySharedWithMe || hasLevelAccess || hasAttributeMatch;
    });
  }, [allFiles, userId, myAttributes, myLevel]);
 
  //files that I upload
  const myUploadedFiles = useMemo(() => {
    if (!userId) return [];
    return allFiles.filter(file => String(file.ownerId) === String(userId));
  }, [allFiles, userId]);
 
  // My shared files (files I uploaded)
  const sharedFiles = useMemo(() => {
    if (currentUserId === null) return [];
    return allFiles.filter(file => String(file.ownerId) === String(currentUserId));
  }, [allFiles, currentUserId]);


  const handleDelete = async (fileId: string) => {
    setFileToDelete(fileId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete =async () => {

    if (!fileToDelete) return;

      try {
    await deleteFile(fileToDelete);

    setAllFiles(prev =>
      prev.filter(f => f.id !== fileToDelete)
    );

    setIsDeleteModalOpen(false);
    setFileToDelete(null);

    setShowSuccessToast(true);

    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);

  } catch (error) {
    console.error("Delete failed:", error);
    alert("Failed to delete file");
  }
  };

  const base64ToBytes = (base64: string): Uint8Array => {
    const binary = atob(base64);
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  };

  const decryptFrontendEncryptedFile = async (
    encryptedBuffer: ArrayBuffer,
    base64Key: string
  ): Promise<ArrayBuffer> => {
    const encryptedBytes = new Uint8Array(encryptedBuffer);

    // 上传时前 12 字节保存的是 IV
    const iv = encryptedBytes.slice(0, 12);

    // 后面的内容才是真正的密文
    const ciphertext = encryptedBytes.slice(12);

    const rawKeyBytes = base64ToBytes(base64Key);

    const cryptoKey = await window.crypto.subtle.importKey(
      "raw",
      rawKeyBytes,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );

    return await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      ciphertext
    );
  };



  const handleDownload = async (file: FileItem) => {
    try {
      const response = await downloadFile(file.id);

      // AES key from backend
      const sessionKeyBase64 = response.headers["x-session-key"];

      if (!sessionKeyBase64) {
        throw new Error("Missing X-Session-Key from backend response.");
      }

      // has been abe decryption
      const encryptedArrayBuffer = await response.data.arrayBuffer();

      //aes decrypt
      const decryptedBuffer = await decryptFrontendEncryptedFile(
        encryptedArrayBuffer,
        sessionKeyBase64
      );

      const blob = new Blob([decryptedBuffer]);
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;

      // refine file name
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
  // Reusable table component for both sections
 const FileTable = ({ files, isMyFiles }: { files: FileItem[]; isMyFiles: boolean }) => (
    <div className="hidden md:block overflow-x-auto bg-slate-50 dark:bg-slate-900/10 transition-colors duration-300">
      <table className="w-full table-fixed">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700/50 bg-slate-100 dark:bg-slate-900/50 transition-colors duration-300">
            <th className="w-[40%] px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">File Name</th>
            <th className="w-[25%] px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">Policy</th>
            <th className="w-[20%] px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">Accessibility</th>
            <th className="w-[15%] px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-300" w-32>Action</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file.id} className="border-b border-slate-200 dark:border-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <FileText className={`w-5 h-5 ${isMyFiles ? "text-emerald-600 dark:text-emerald-400" : "text-cyan-600 dark:text-cyan-400"}`} />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{file.name}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{file.uploadDate}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{file.ownerName}</td>
              <td className="px-6 py-4">
                <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 transition-colors" title={file.policyDetails}>
                  <Shield className={`w-3 h-3 ${file.accessible ? "text-emerald-500 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}`} />
                  <span className="text-[11px] text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{file.policy}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                {file.accessible ? (
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" /> accessible
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Lock className="w-3 h-3" /> locked
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-end gap-2"></div>
                <button 
                      onClick={() => handleDownload(file)} 
                      className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                </button>
                  {isMyFiles && 
                    <button 
                      onClick={() => handleDelete(file.id)} 
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Reusable mobile card component
  const MobileFileCards = ({ files, isMyFiles }: { files: FileItem[]; isMyFiles: boolean }) => (
    <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-700/50 bg-slate-50 dark:bg-slate-900/10 transition-colors duration-300">
      {files.map((file) => (
        <div key={file.id} className="p-4 hover:bg-white dark:hover:bg-slate-800/20 transition-colors">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => isMyFiles 
              ? setExpandedMyFile(expandedMyFile === file.id ? null : file.id)
              : setExpandedFile(expandedFile === file.id ? null : file.id)
            }
          >
            <div className="flex items-center gap-3">
              <FileText className={`w-8 h-8 ${isMyFiles ? "text-emerald-600 dark:text-emerald-400" : "text-cyan-600 dark:text-cyan-400"}`} />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{file.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{file.ownerName}</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 dark:text-slate-500 transition-transform ${
              isMyFiles 
                ? (expandedMyFile === file.id ? 'rotate-180' : '')
                : (expandedFile === file.id ? 'rotate-180' : '')
            }`} />
          </div>
          {(isMyFiles ? expandedMyFile === file.id : expandedFile === file.id) && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/50 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">date:</span>
                <span className="text-slate-700 dark:text-slate-300">{file.uploadDate}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">policy:</span>
                <span className="text-emerald-600 dark:text-emerald-400">{file.policy}</span>
              </div>
              <Button size="sm" className="w-full gap-2" variant={file.accessible ? "default" : "secondary"}>
                {isMyFiles ? (
                  <><Download className="w-4 h-4" /> manage sharing</>
                ) : file.accessible ? (
                  <><Download className="w-4 h-4" /> download file</>
                ) : (
                  <><AlertCircle className="w-4 h-4" /> access</>
                )}
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* SECTION 1: Shared With Me (Files others shared with me) */}
      <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-sm dark:shadow-xl transition-colors duration-300">
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/20 transition-colors duration-300">
          <div className="flex items-center gap-3 mb-1">
            <FolderDown className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            <h2 className="font-display text-xl sm:text-2xl text-slate-900 dark:text-slate-100">Shared With Me</h2>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
            Files others have shared with you - all encrypted safely
          </p>
        </div>

        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            <p className="text-sm">decrypting list...</p>
          </div>
        ) : sharedFiles.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
            <FolderDown className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm">No files shared with you yet</p>
          </div>
        ) : (
          <>
            <FileTable files={sharedFiles} isMyFiles={false} />
            <MobileFileCards files={sharedFiles} isMyFiles={false} />
          </>
        )}
      </div>

      {/* SECTION 2: My Shared Files (Files I uploaded) */}
      <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-sm dark:shadow-xl transition-colors duration-300">
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/20 transition-colors duration-300">
          <div className="flex items-center gap-3 mb-1">
            <Upload className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h2 className="font-display text-xl sm:text-2xl text-slate-900 dark:text-slate-100">My Shared Files</h2>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
            Files you have uploaded and shared with others
          </p>
        </div>

        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <p className="text-sm">loading your files...</p>
          </div>
        ) : mySharedFiles.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
            <Upload className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm">No files uploaded yet</p>
          </div>
        ) : (
          <>
            <FileTable files={mySharedFiles} isMyFiles={true} />
            <MobileFileCards files={mySharedFiles} isMyFiles={true} />
          </>
        )}
      </div>
    </div>
  );}