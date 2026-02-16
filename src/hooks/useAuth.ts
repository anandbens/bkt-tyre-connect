import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [dealerCode, setDealerCode] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          // Fetch role from user_roles table
          const { data } = await supabase
            .from("user_roles")
            .select("role, dealer_code")
            .eq("user_id", session.user.id)
            .maybeSingle();
          setUserRole(data?.role ?? null);
          setDealerCode(data?.dealer_code ?? null);
        } else {
          setUserRole(null);
          setDealerCode(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from("user_roles")
          .select("role, dealer_code")
          .eq("user_id", session.user.id)
          .maybeSingle()
          .then(({ data }) => {
            setUserRole(data?.role ?? null);
            setDealerCode(data?.dealer_code ?? null);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
    setDealerCode(null);
  };

  return { user, session, loading, userRole, dealerCode, signIn, signUp, signOut };
}
