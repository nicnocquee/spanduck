import DashboardLayout from "@/components/DashboardLayout";
import { protectPage } from "@/utils/routes";

function Dashboard() {
  return (
    <DashboardLayout title="Dashboard">
      <h1>Dashboard Page</h1>
    </DashboardLayout>
  );
}

export default protectPage(Dashboard);
