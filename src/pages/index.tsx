import { useAuth } from "@/contexts/AuthContext";
import { protectPage } from "@/utils/routes";
import { supabase } from "@/utils/supabase";

function Home() {
  const { data } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      <h1 className="Hello, text-3xl font-bold">{data?.user_metadata?.name}</h1>
      <button onClick={handleLogout}>Logout</button>
    </>
  );
}

export default protectPage(Home);
