import { DashboardLayout } from "@/components/DashboardLayout";
import { SecureFileExplorer } from "@/components/FileExplorer";


export default function FileExplorer() {
  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl mb-2">File management Panel</h1>
          <p className="text-slate-400">
            Manage your encrypted files.
          </p>
        </div>



        {/* Secure File Explorer */}
        <div className="mb-8">
          <SecureFileExplorer />
        </div>


      </div>
    </DashboardLayout>
  );
}
