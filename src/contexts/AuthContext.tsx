import {
  createContext,
  FunctionComponent,
  ReactElement,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "@/utils/supabase";
import { User } from "@supabase/supabase-js";

type Value = {
  isFetching: boolean;
  data?: User;
};

const AuthContext = createContext<Value>({
  isFetching: true,
  data: undefined,
});

export const AuthProvider: FunctionComponent<{
  children: ReactElement;
}> = ({ children }) => {
  const [data, setData] = useState<Value>({
    isFetching: true,
    data: undefined,
  });

  useEffect(() => {
    supabase.auth.getSession().then((session) => {
      setData({ isFetching: false, data: session.data.session?.user });
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setData({ isFetching: false, data: session?.user });
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  return context;
};
