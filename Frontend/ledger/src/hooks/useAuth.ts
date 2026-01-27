import { useAuthContext } from "@/context/AuthContext";

export function useAuth() {
  const context = useAuthContext();
  const authHeader = context.token ? { Authorization: `Bearer ${context.token}` } : {};

  return {
    ...context,
    isAuthenticated: Boolean(context.token),
    authHeader,
  };
}
