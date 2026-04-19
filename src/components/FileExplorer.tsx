import { useState, useEffect, useMemo } from "react";
import { 
  FileText, Shield, Lock, Download, Share2, 
  AlertCircle, ChevronDown, FolderDown, Loader2, Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMyAttributes, getAllFiles } from "@/lib/api";

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

  // Files shared with me (uploaded by others)
  const mySharedFiles = useMemo(() => {
    if (currentUserId === null) return [];
    return allFiles.filter(file => String(file.ownerId) !== String(currentUserId));
  }, [allFiles, currentUserId]);

  // My shared files (files I uploaded)
  const sharedFiles = useMemo(() => {
    if (currentUserId === null) return [];
    return allFiles.filter(file => String(file.ownerId) === String(currentUserId));
  }, [allFiles, currentUserId]);

  // Reusable table component for both sections
  const FileTable = ({ files, isMyFiles }: { files: FileItem[]; isMyFiles: boolean }) => (
    <div className="hidden md:block overflow-x-auto bg-slate-900/10">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-700/50 bg-slate-900/50">
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300">File name</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300">owner</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300">policy</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300">accessibility</th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-300">action</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file.id} className="border-b border-slate-700/30 hover:bg-slate-800/40 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <FileText className={`w-5 h-5 ${isMyFiles ? "text-emerald-400" : "text-cyan-400"}`} />
                  <div>
                    <p className="text-sm font-medium text-slate-200">{file.name}</p>
                    <p className="text-[10px] text-slate-500">{file.uploadDate}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-300">{file.ownerName}</td>
              <td className="px-6 py-4">
                <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-slate-800/50 border border-slate-700/50" title={file.policyDetails}>
                  <Shield className={`w-3 h-3 ${file.accessible ? "text-emerald-400" : "text-slate-500"}`} />
                  <span className="text-[11px] text-slate-300 truncate max-w-[150px]">{file.policy}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                {file.accessible ? (
                  <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> accessible
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                    <Lock className="w-3 h-3" /> locked
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                {isMyFiles ? (
                  <button className="p-2 hover:bg-emerald-500/20 rounded-lg text-slate-400 hover:text-emerald-400 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                ) : (
                  file.accessible ? (
                    <button className="p-2 hover:bg-cyan-500/20 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  ) : (
                    <button className="p-2 hover:bg-yellow-500/10 rounded-lg text-slate-400 hover:text-yellow-500 transition-colors">
                      <AlertCircle className="w-4 h-4" />
                    </button>
                  )
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Reusable mobile card component
  const MobileFileCards = ({ files, isMyFiles }: { files: FileItem[]; isMyFiles: boolean }) => (
    <div className="md:hidden divide-y divide-slate-700/50 bg-slate-900/10">
      {files.map((file) => (
        <div key={file.id} className="p-4">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => isMyFiles 
              ? setExpandedMyFile(expandedMyFile === file.id ? null : file.id)
              : setExpandedFile(expandedFile === file.id ? null : file.id)
            }
          >
            <div className="flex items-center gap-3">
              <FileText className={`w-8 h-8 ${isMyFiles ? "text-emerald-400" : "text-cyan-400"}`} />
              <div>
                <p className="text-sm font-medium text-slate-200">{file.name}</p>
                <p className="text-xs text-slate-500">{file.ownerName}</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${
              isMyFiles 
                ? (expandedMyFile === file.id ? 'rotate-180' : '')
                : (expandedFile === file.id ? 'rotate-180' : '')
            }`} />
          </div>
          {(isMyFiles ? expandedMyFile === file.id : expandedFile === file.id) && (
            <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">date:</span>
                <span className="text-slate-300">{file.uploadDate}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">policy:</span>
                <span className="text-emerald-400">{file.policy}</span>
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
      <div className="glass rounded-xl border border-slate-700/50 overflow-hidden shadow-xl">
        <div className="p-4 sm:p-6 border-b border-slate-700/50 bg-slate-900/20">
          <div className="flex items-center gap-3 mb-1">
            <FolderDown className="w-6 h-6 text-cyan-400" />
            <h2 className="font-display text-xl sm:text-2xl text-slate-100">Shared With Me</h2>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm">
            Files others have shared with you - all encrypted safely
          </p>
        </div>

        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            <p className="text-sm">decrypting list...</p>
          </div>
        ) : sharedFiles.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500">
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
      <div className="glass rounded-xl border border-slate-700/50 overflow-hidden shadow-xl">
        <div className="p-4 sm:p-6 border-b border-slate-700/50 bg-slate-900/20">
          <div className="flex items-center gap-3 mb-1">
            <Upload className="w-6 h-6 text-emerald-400" />
            <h2 className="font-display text-xl sm:text-2xl text-slate-100">My Shared Files</h2>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm">
            Files you have uploaded and shared with others
          </p>
        </div>

        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <p className="text-sm">loading your files...</p>
          </div>
        ) : mySharedFiles.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500">
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
  );
}