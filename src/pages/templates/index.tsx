import DashboardLayout from "@/components/DashboardLayout";
import { protectPage } from "@/utils/routes";

function Templates() {
  return (
    <DashboardLayout title="Templates">
      <h1>Templates Page</h1>
    </DashboardLayout>
  );
}

export default protectPage(Templates);
