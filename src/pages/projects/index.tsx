import DashboardLayout from "@/components/DashboardLayout";
import { protectPage } from "@/utils/routes";

function Projects() {
  return (
    <DashboardLayout title="Projects">
      <div>
        <p>Project Page</p>
      </div>
    </DashboardLayout>
  );
}

export default protectPage(Projects);
