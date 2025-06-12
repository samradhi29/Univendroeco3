import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useAuth() {
  const {
    data: user,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["/api/auth/user"],
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

  // Log auth state changes for debugging
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
