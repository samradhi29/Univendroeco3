import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { apiRequest } from "@/lib/queryClient";

export function useVendor() {
  const { user, isAuthenticated, isDomainOwner } = useAuth();

  // Get current domain info
  const { data: domain } = useQuery({
    queryKey: ["/api/storefront/by-domain"],
    enabled: !!user,
  });

  // Get vendor info only if user is a seller and owns this domain
  const { data: vendor, isLoading } = useQuery({
    queryKey: ["/api/vendors/my"],
    enabled: !!user && user.role === "seller" && isDomainOwner,
    // Return null if query is disabled
    select: (data) => (user?.role === "seller" && isDomainOwner ? data : null),
  });

  // Log vendor access state for debugging
  if (user) {
    console.log("Vendor access state:", {
      userId: user.id,
      email: user.email,
      role: user.role,
      originalRole: user.originalRole,
      isDomainOwner,
      hasVendorAccess: !!vendor,
      domain: domain?.vendor?.domain,
    });
  }

  return {
    vendor,
    domain,
    isLoading,
    isVendorDomain: isDomainOwner,
    hasDomainAccess: Boolean(
      isAuthenticated && user?.role === "seller" && isDomainOwner && vendor
    ),
  };
}
