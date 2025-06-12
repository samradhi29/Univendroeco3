import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useVendor } from "@/hooks/useVendor";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Package, ShoppingCart, TrendingUp } from "lucide-react";

export default function SellerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { vendor, domain, isLoading, hasDomainAccess } = useVendor();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Redirect if not authenticated or not a seller
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "seller")) {
      toast({
        title: "Access Denied",
        description: "You must be logged in as a seller to access this page.",
        variant: "destructive",
      });
      setLocation("/login");
    }
  }, [isAuthenticated, user, isLoading, toast, setLocation]);

  // Show domain access warning
  useEffect(() => {
    if (!isLoading && user?.role === "seller" && !hasDomainAccess) {
      toast({
        title: "Domain Access Required",
        description: "Please access your store through your assigned domain.",
        variant: "destructive",
      });
    }
  }, [isLoading, user, hasDomainAccess, toast]);

  if (isLoading || !user || user.role !== "seller") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasDomainAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">
              Domain Access Required
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Globe className="w-16 h-16 text-gray-400 mx-auto" />
            <p className="text-gray-600">
              Please access your store through your assigned domain:
            </p>
            <div className="font-mono bg-gray-100 p-2 rounded">
              {vendor?.domain || "No domain assigned"}
            </div>
            <Button
              onClick={() =>
                (window.location.href = `https://${vendor?.domain}`)
              }
              className="w-full"
            >
              Go to My Store
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Seller Dashboard</h1>
          <p className="text-gray-600">
            Welcome to your store dashboard, {vendor?.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Domain:</span>
          <span className="font-mono bg-gray-100 px-2 py-1 rounded">
            {domain?.vendor?.domain}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {domain?.products?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active products in your store
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {domain?.orders?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Orders received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Store Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {vendor?.status || "Active"}
            </div>
            <p className="text-xs text-muted-foreground">
              Current store status
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add more dashboard content here */}
    </div>
  );
}
