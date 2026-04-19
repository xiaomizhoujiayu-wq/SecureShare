import { DashboardLayout } from "@/components/DashboardLayout";
import { IdentityStatus } from "@/components/IdentityStatus";
import { AttributeMarketplace } from "@/components/Attribute";


export default function Profile() {
  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl mb-2">Attribute Management</h1>
          <p className="text-slate-400">
            Manage your cryptographic identity
          </p>
        </div>

        {/* Top Section: Identity Status */}
        <div className="mb-8">
          <IdentityStatus />
        </div>


        {/* Attribute Marketplace */}
        <div className="mb-8">
          <AttributeMarketplace />
        </div>

      </div>
    </DashboardLayout>
  );
}
