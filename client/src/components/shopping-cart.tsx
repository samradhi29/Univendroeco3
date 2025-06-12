import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, X, Package, ShoppingBag, CreditCard } from "lucide-react";

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
  cartItems: any[];
  refetchCart: () => void;
}

export function ShoppingCart({ isOpen, onClose, onCheckout, cartItems, refetchCart }: ShoppingCartProps) {
  const { toast } = useToast();

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      await apiRequest("PUT", `/api/cart/${productId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update cart item",
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest("DELETE", `/api/cart/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Removed",
        description: "Item removed from cart",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    },
  });

  const subtotal = cartItems.reduce((sum, item) => 
    sum + (parseFloat(item.product.sellingPrice || item.product.price) * item.quantity), 0
  );
  
  const taxRate = 0.18; // 18% GST
  const taxAmount = subtotal * taxRate;
  const shippingFee = subtotal > 500 ? 0 : 50;
  const total = subtotal + taxAmount + shippingFee;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl transform transition-transform">
        <Card className="h-full flex flex-col">
          <CardHeader className="border-b border-gray-200">
            <div className="flex justify-between items-center">
              <CardTitle>Shopping Cart</CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <i className="fas fa-times"></i>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Your cart is empty</p>
                <p className="text-sm text-gray-500">Add items to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-start space-x-4 border-b border-gray-200 pb-4">
                    <img 
                      src={item.product.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop"}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{item.product.name}</h4>
                      <p className="text-sm text-gray-600">{item.product.vendor?.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg font-semibold text-gray-900">
                          ₹{(item.product.sellingPrice || item.product.price)}
                        </span>
                        {item.product.mrp && parseFloat(item.product.mrp) > parseFloat(item.product.sellingPrice || item.product.price) && (
                          <span className="text-sm text-gray-500 line-through">₹{item.product.mrp}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            if (item.quantity > 1) {
                              updateQuantityMutation.mutate({ 
                                productId: item.productId, 
                                quantity: item.quantity - 1 
                              });
                            } else {
                              removeItemMutation.mutate(item.productId);
                            }
                          }}
                          disabled={updateQuantityMutation.isPending || removeItemMutation.isPending}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="px-3 py-1 bg-gray-100 rounded text-sm font-medium min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateQuantityMutation.mutate({ 
                            productId: item.productId, 
                            quantity: item.quantity + 1 
                          })}
                          disabled={updateQuantityMutation.isPending}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ₹{(parseFloat(item.product.sellingPrice || item.product.price) * item.quantity).toFixed(2)}
                      </p>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeItemMutation.mutate(item.productId)}
                        disabled={removeItemMutation.isPending}
                        className="mt-2 h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-gray-200 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST (18%)</span>
                  <span className="font-medium">₹{taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shippingFee === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `₹${shippingFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                {subtotal < 500 && (
                  <p className="text-xs text-gray-500">Add ₹{(500 - subtotal).toFixed(2)} more for free shipping</p>
                )}
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-primary">₹{total.toFixed(2)}</span>
                </div>
              </div>
              <Button 
                onClick={onCheckout}
                className="w-full"
                size="lg"
              >
                Proceed to Checkout
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
