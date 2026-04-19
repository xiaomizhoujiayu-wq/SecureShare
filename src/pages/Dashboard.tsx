import { DashboardLayout } from "@/components/DashboardLayout";
import { EncryptionWizard } from "@/components/EncryptionWizard";
import { Lock } from "lucide-react";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl mb-2">ABE Control Panel</h1>
          <p className="text-slate-400">
            Manage your cryptographic identity, encrypt files, and control access with Attribute-Based Encryption
          </p>
        </div>


        {/* Middle Section: Encryption Wizard */}
        <div className="mb-8">
          <EncryptionWizard />
        </div>



        {/* Security Footer */}
        <div className="glass rounded-xl p-6 border border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <Lock className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Ciphertext-Policy ABE (CP-ABE) Security</h3>
              <p className="text-slate-400 text-sm">
                Your files are encrypted with AES-256 session keys, which are then protected using CP-ABE based on your defined policies. Only users whose attributes satisfy the policy can decrypt and access your files. Your private key is securely managed and re-keyed whenever new attributes are approved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
