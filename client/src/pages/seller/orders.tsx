import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { InvoiceGenerator } from "@/components/invoice-generator";
import {
  Package,
  Search,
  Eye,
  Filter,
  FileText,
  Truck,
  Calendar,
  DollarSign,
  ShoppingCart,
  Users,
} from "lucide-react";

export default function SellerOrders() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

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

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
    enabled: !!user && user.role === "seller",
  });

  const { data: vendor } = useQuery({
    queryKey: ["/api/vendors/my"],
    enabled: !!user && user.role === "seller",
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: number;
      status: string;
    }) => {
      await apiRequest("PUT", `/api/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !user || user.role !== "seller") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Filter orders for this vendor only
  const vendorOrders = (orders as any[]).filter(
    (order) => order.vendorId === vendor?.id
  );

  const filteredOrders = vendorOrders.filter((order: any) => {
    const matchesSearch =
      order.id?.toString().includes(searchTerm) ||
      order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.firstName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.customer?.lastName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, label: "Pending" },
      confirmed: { variant: "default" as const, label: "Confirmed" },
      processing: { variant: "default" as const, label: "Processing" },
      shipped: { variant: "default" as const, label: "Shipped" },
      delivered: { variant: "default" as const, label: "Delivered" },
      cancelled: { variant: "destructive" as const, label: "Cancelled" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleStatusUpdate = (orderId: number, newStatus: string) => {
    updateOrderStatusMutation.mutate({ orderId, status: newStatus });
  };

  // Calculate stats
  const totalOrders = vendorOrders.length;
  const totalRevenue = vendorOrders.reduce(
    (sum, order) => sum + parseFloat(order.total || 0),
    0
  );
  const pendingOrders = vendorOrders.filter(
    (order) => order.status === "pending"
  ).length;
  const shippedOrders = vendorOrders.filter(
    (order) => order.status === "shipped"
  ).length;

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your store orders and download invoices
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <ShoppingCart className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Orders
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalOrders}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{totalRevenue.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Pending Orders
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pendingOrders}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Shipped Orders
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {shippedOrders}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by order ID, customer name, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Your Orders ({filteredOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Orders Found
                </h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "You haven't received any orders yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order: any) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          #{order.id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {order.customerInfo?.firstName}{" "}
                              {order.customerInfo?.lastName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {order.customerInfo?.email}
                            </p>
                            <p className="text-sm text-gray-500">
                              {order.customerInfo?.phone}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{order.items?.length || 0} items</TableCell>
                        <TableCell className="font-medium">
                          ₹{parseFloat(order.total || 0).toFixed(2)}
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-IN"
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedOrder(order)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>
                                    Order Details - #{selectedOrder?.id}
                                  </DialogTitle>
                                </DialogHeader>
                                {selectedOrder && (
                                  <div className="space-y-6">
                                    {/* Customer Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-lg">
                                            Customer Information
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                          <div className="space-y-2">
                                            <p>
                                              <strong>Name:</strong>{" "}
                                              {
                                                selectedOrder.customerInfo
                                                  ?.firstName
                                              }{" "}
                                              {
                                                selectedOrder.customerInfo
                                                  ?.lastName
                                              }
                                            </p>
                                            <p>
                                              <strong>Email:</strong>{" "}
                                              {
                                                selectedOrder.customerInfo
                                                  ?.email
                                              }
                                            </p>
                                            <p>
                                              <strong>Phone:</strong>{" "}
                                              {
                                                selectedOrder.customerInfo
                                                  ?.phone
                                              }
                                            </p>
                                          </div>
                                        </CardContent>
                                      </Card>

                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-lg">
                                            Shipping Address
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                          <div className="space-y-2">
                                            <p>
                                              {
                                                selectedOrder.shippingAddress
                                                  ?.address
                                              }
                                            </p>
                                            <p>
                                              {
                                                selectedOrder.shippingAddress
                                                  ?.city
                                              }
                                              ,{" "}
                                              {
                                                selectedOrder.shippingAddress
                                                  ?.state
                                              }
                                            </p>
                                            <p>
                                              PIN:{" "}
                                              {
                                                selectedOrder.shippingAddress
                                                  ?.zipCode
                                              }
                                            </p>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    </div>

                                    {/* Order Items */}
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg">
                                          Order Items
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead>Product</TableHead>
                                              <TableHead>Quantity</TableHead>
                                              <TableHead>Price</TableHead>
                                              <TableHead>Total</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {selectedOrder.items?.map(
                                              (item: any, index: number) => (
                                                <TableRow key={index}>
                                                  <TableCell>
                                                    {item.product?.name}
                                                  </TableCell>
                                                  <TableCell>
                                                    {item.quantity}
                                                  </TableCell>
                                                  <TableCell>
                                                    ₹
                                                    {parseFloat(
                                                      item.price
                                                    ).toFixed(2)}
                                                  </TableCell>
                                                  <TableCell>
                                                    ₹
                                                    {(
                                                      parseFloat(item.price) *
                                                      item.quantity
                                                    ).toFixed(2)}
                                                  </TableCell>
                                                </TableRow>
                                              )
                                            )}
                                          </TableBody>
                                        </Table>

                                        <Separator className="my-4" />

                                        <div className="space-y-2">
                                          <div className="flex justify-between">
                                            <span>Subtotal:</span>
                                            <span>
                                              ₹
                                              {parseFloat(
                                                selectedOrder.subtotal || 0
                                              ).toFixed(2)}
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Tax (GST 18%):</span>
                                            <span>
                                              ₹
                                              {parseFloat(
                                                selectedOrder.taxAmount || 0
                                              ).toFixed(2)}
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Shipping:</span>
                                            <span>
                                              ₹
                                              {parseFloat(
                                                selectedOrder.shippingFee || 0
                                              ).toFixed(2)}
                                            </span>
                                          </div>
                                          <Separator />
                                          <div className="flex justify-between font-bold text-lg">
                                            <span>Total:</span>
                                            <span>
                                              ₹
                                              {parseFloat(
                                                selectedOrder.total || 0
                                              ).toFixed(2)}
                                            </span>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>

                                    {/* Order Status Management */}
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg">
                                          Order Management
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="flex items-center gap-4">
                                          <Select
                                            value={selectedOrder.status}
                                            onValueChange={(value) =>
                                              handleStatusUpdate(
                                                selectedOrder.id,
                                                value
                                              )
                                            }
                                          >
                                            <SelectTrigger className="w-48">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="pending">
                                                Pending
                                              </SelectItem>
                                              <SelectItem value="confirmed">
                                                Confirmed
                                              </SelectItem>
                                              <SelectItem value="processing">
                                                Processing
                                              </SelectItem>
                                              <SelectItem value="shipped">
                                                Shipped
                                              </SelectItem>
                                              <SelectItem value="delivered">
                                                Delivered
                                              </SelectItem>
                                              <SelectItem value="cancelled">
                                                Cancelled
                                              </SelectItem>
                                            </SelectContent>
                                          </Select>

                                          <div className="flex gap-2">
                                            <InvoiceGenerator
                                              order={selectedOrder}
                                              type="invoice"
                                            />
                                            <InvoiceGenerator
                                              order={selectedOrder}
                                              type="shipping"
                                            />
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            <InvoiceGenerator order={order} type="invoice" />
                            <InvoiceGenerator order={order} type="shipping" />

                            <Select
                              value={order.status}
                              onValueChange={(value) =>
                                handleStatusUpdate(order.id, value)
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">
                                  Confirmed
                                </SelectItem>
                                <SelectItem value="processing">
                                  Processing
                                </SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">
                                  Delivered
                                </SelectItem>
                                <SelectItem value="cancelled">
                                  Cancelled
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
