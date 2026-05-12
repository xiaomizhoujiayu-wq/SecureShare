import { AdminPanel } from "@/components/AssignAttribute";
import { DashboardLayout } from "@/components/DashboardLayout";


export default function Admin() {
  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl mb-2 text-slate-900 dark:text-white">Super admin Panel</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            Manage your encrypted files.
          </p>
        </div>



        {/* admin */}
        <div className="mb-8">
          <AdminPanel />
        </div>

      </div>
    </DashboardLayout>
  );
}
