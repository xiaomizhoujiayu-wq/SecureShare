import { DashboardLayout } from "@/components/DashboardLayout";
import { IdentityStatus } from "@/components/IdentityStatus";


export default function Profile() {
  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl mb-2 text-slate-900 dark:text-white">Identity Panel</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            Your identity and active attributes
          </p>
        </div>

        {/* Top Section: Identity Status */}
        <div className="mb-8">
          <IdentityStatus />
        </div>


        {/* Attribute Marketplace */}
        
        {/* <div className="mb-8">
          <AttributeMarketplace />
        </div> */}

      </div>
    </DashboardLayout>
  );
}
