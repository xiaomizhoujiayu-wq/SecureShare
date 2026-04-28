import { AdminLayout } from "@/components/AdminLayout";
import { AdminPanel } from "@/components/AssignAttribute";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SubAdminPanel } from "@/components/SubadminPanel";


export default function SubAdmin() {
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



        {/* admin */}
        <div className="mb-8">
          <SubAdminPanel />
        </div>

      </div>
    </DashboardLayout>
  );
}
