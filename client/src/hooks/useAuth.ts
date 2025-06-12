import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: string;
  email: string;
  role: "seller" | "buyer" | "super_admin" | "admin" | string;
  originalRole?: string;
  isDomainOwner?: boolean;
  currentDomain?: string;
  // Add any other properties your user object might have here
}

export function useAuth() {
  const {
    data: user,
    isLoading,
    refetch,
  } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    queryFn: () => apiRequest("/api/auth/user"), // make sure to provide the query function
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  const isAuthenticated = !!user;
  const isSeller = user?.role === "seller";
  const isBuyer = user?.role === "buyer";
  const isSuperAdmin = user?.role === "super_admin";
  const isAdmin = user?.role === "admin";
  const isDomainOwner = user?.isDomainOwner;
  const originalRole = user?.originalRole;

  if (user) {
    console.log("Auth state:", {
      userId: user.id,
      email: user.email,
      role: user.role,
      originalRole: user.originalRole,
      isDomainOwner: user.isDomainOwner,
      currentDomain: user.currentDomain,
    });
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    isSeller,
    isBuyer,
    isSuperAdmin,
    isAdmin,
    isDomainOwner,
    originalRole,
    refetch,
  };
}
