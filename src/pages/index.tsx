import DashboardLayout from "@/components/DashboardLayout";
import { hasUserSession } from "@/utils/routes";
import { GetServerSidePropsContext } from "next";

function Dashboard() {
  return (
    <DashboardLayout title="Dashboard">
      <h1>Dashboard Page</h1>
    </DashboardLayout>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  // Check if user is logged in
  const isLoggedIn = await hasUserSession(ctx);
  if (!isLoggedIn) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

export default Dashboard;
