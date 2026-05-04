import { DashboardLayout } from "@/components/DashboardLayout";
import { EncryptionWizard } from "@/components/EncryptionWizard";
import { Lock } from "lucide-react";


export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl mb-2 text-slate-900 dark:text-white">
        File Encryption & Upload Panel
      </h1>
      
      <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
        Manage your cryptographic identity, encrypt files, and control access with Attribute-Based Encryption
      </p>
        </div>


        {/* Middle Section: Encryption Wizard */}
        <div className="mb-8">
          <EncryptionWizard />
        </div>
        

      
      </div>
    </DashboardLayout>
  );
}
