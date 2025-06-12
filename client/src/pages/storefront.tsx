import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShoppingCart } from "@/components/shopping-cart";
import { CheckoutModal } from "@/components/checkout-modal";
import { Link } from "wouter";
import { Star, Package, Store, X } from "lucide-react";

// Add type definitions to fix TypeScript errors
interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  sellingPrice?: string;
  mrp?: string;
  imageUrl?: string;
  isActive: boolean;
  vendor?: {
    id: number;
    name: string;
    logo?: string;
    rating?: number;
    productCount?: number;
  };
}

interface CartItem {
  id: number;
  quantity: number;
  product: Product;
  selectedColor?: string;
  selectedSize?: string;
}

interface ColorOption {
  color: string;
  name: string;
  imageUrl: string;
}

interface SizeOption {
  size: string;
  name: string;
}

// Guest cart management functions
const GUEST_CART_KEY = 'guest_cart';

function getGuestCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const cart = localStorage.getItem(GUEST_CART_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch {
    return [];
  }
}

function setGuestCart(cart: CartItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Failed to save guest cart:', error);
  }
}

function clearGuestCart(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(GUEST_CART_KEY);
  } catch (error) {
    console.error('Failed to clear guest cart:', error);
  }
}

function mergeCarts(guestCart: CartItem[], userCart: CartItem[]): CartItem[] {
  const mergedCartMap: Record<number, CartItem> = {};

  // Add items from user cart first (priority)
  userCart.forEach((item) => {
    mergedCartMap[item.product.id] = { ...item };
  });

  // Add items from guest cart, combining quantities if product exists
  guestCart.forEach((item) => {
    if (mergedCartMap[item.product.id]) {
      // Combine quantities if product exists in both
      mergedCartMap[item.product.id].quantity += item.quantity;
    } else {
      mergedCartMap[item.product.id] = { ...item };
    }
  });

  return Object.values(mergedCartMap);
}

// Product Selection Modal Component
interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (productId: number, color: string, size: string) => void;
  onBuyNow: (productId: number, color: string, size: string) => void;
  isLoading: boolean;
}

function ProductModal({ product, isOpen, onClose, onAddToCart, onBuyNow, isLoading }: ProductModalProps) {
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [currentImage, setCurrentImage] = useState<string>('');
  const { toast } = useToast();

  const colorOptions: ColorOption[] = [
    { color: "red", name: "Red", imageUrl: "https://tse3.mm.bing.net/th?id=OIP.02ltv8cP9zTI9bRen--n0gHaHa&pid=Api&P=0&h=180" },
    { color: "blue", name: "Blue", imageUrl: "https://purepng.com/public/uploads/large/purepng.com-denim-blue-full-plain-shirtgarmentdressshirtfitfront-buttonfront-pocketdenim-bluefull-1421526313681j3qsz.png" },
    { color: "green", name: "Green", imageUrl: "http://5.imimg.com/data5/SELLER/Default/2024/2/388633951/XP/BZ/DE/15946523/dark-blue-plaint-t-shirt-1000x1000.jpg" },
    { color: "black", name: "Black", imageUrl: "https://tse1.mm.bing.net/th?id=OIP.AHykd4gwINedzbavUhyeLwHaHa&pid=Api&P=0&h=180" },
  ];

  const sizeOptions: SizeOption[] = [
    { size: "XS", name: "Extra Small" },
    { size: "S", name: "Small" },
    { size: "M", name: "Medium" },
    { size: "L", name: "Large" },
    { size: "XL", name: "Extra Large" },
    { size: "XXL", name: "Double Extra Large" },
  ];

  // Reset selections when product changes
  useEffect(() => {
    if (product) {
      setSelectedColor('');
      setSelectedSize('');
      setCurrentImage(product.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop");
    }
  }, [product]);

  // Update image when color is selected
  useEffect(() => {
    if (selectedColor) {
      const colorOption = colorOptions.find(option => option.color === selectedColor);
      if (colorOption) {
        setCurrentImage(colorOption.imageUrl);
      }
    }
  }, [selectedColor]);

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize) {
      toast({
        title: "Selection Required",
        description: "Please select color and size to add product into cart.",
        variant: "destructive",
      });
      return;
    }
    if (product) {
      onAddToCart(product.id, selectedColor, selectedSize);
    }
  };

  const handleBuyNow = () => {
    if (!selectedColor || !selectedSize) {
      toast({
        title: "Selection Required", 
        description: "Please select color and size to add product into cart.",
        variant: "destructive",
      });
      return;
    }
    if (product) {
      onBuyNow(product.id, selectedColor, selectedSize);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Thumbnail Images */}
            <div className="flex gap-2 flex-wrap">
              <img
                src={product.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop"}
                alt="Default"
                className="w-16 h-16 rounded-md object-cover cursor-pointer border-2 border-transparent hover:border-primary"
                onClick={() => setCurrentImage(product.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop")}
              />
              {colorOptions.map((option) => (
                <img
                  key={option.color}
                  src={option.imageUrl}
                  alt={option.name}
                  className="w-16 h-16 rounded-md object-cover cursor-pointer border-2 border-transparent hover:border-primary"
                  onClick={() => setCurrentImage(option.imageUrl)}
                />
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {product.name}
              </h3>
              <p className="text-gray-600 mb-4">
                {product.description}
              </p>
              
              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-primary">
                  ₹{product.sellingPrice || product.price}
                </span>
                {product.mrp &&
                  parseFloat(product.mrp) >
                    parseFloat(product.sellingPrice || product.price) && (
                    <span className="text-xl text-gray-500 line-through">
                      ₹{product.mrp}
                    </span>
                  )}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <h4 className="text-lg font-semibold mb-3">
                Color {selectedColor && <span className="text-primary">({selectedColor})</span>}
              </h4>
              <div className="flex gap-3 flex-wrap">
                {colorOptions.map((option) => (
                  <button
                    key={option.color}
                    className={`w-12 h-12 rounded-full border-2 transition-all ${
                      selectedColor === option.color
                        ? 'border-primary ring-2 ring-primary ring-offset-2'
                        : 'border-gray-300 hover:border-primary'
                    }`}
                    style={{ backgroundColor: option.color }}
                    onClick={() => setSelectedColor(option.color)}
                    title={option.name}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <h4 className="text-lg font-semibold mb-3">
                Size {selectedSize && <span className="text-primary">({selectedSize})</span>}
              </h4>
              <div className="flex gap-2 flex-wrap">
                {sizeOptions.map((option) => (
                  <button
                    key={option.size}
                    className={`px-4 py-2 border rounded-md transition-all ${
                      selectedSize === option.size
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-300 hover:border-primary'
                    }`}
                    onClick={() => setSelectedSize(option.size)}
                  >
                    {option.size}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleAddToCart}
                disabled={!product.isActive || isLoading}
                variant="outline"
                className="flex-1"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Add to Cart"
                )}
              </Button>
              <Button
                onClick={handleBuyNow}
                disabled={!product.isActive || isLoading}
                className="flex-1"
              >
                Buy Now
              </Button>
            </div>

            {!product.isActive && (
              <div className="text-center py-4">
                <span className="text-red-600 font-semibold">
                  Out of Stock
                </span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Product Card Component with individual hover state
interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
}

function ProductCard({ product, onProductClick }: ProductCardProps) {
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  
  const colorOptions = [
    { color: "red", imageUrl: "https://tse3.mm.bing.net/th?id=OIP.02ltv8cP9zTI9bRen--n0gHaHa&pid=Api&P=0&h=180" },
    { color: "blue", imageUrl: "https://purepng.com/public/uploads/large/purepng.com-denim-blue-full-plain-shirtgarmentdressshirtfitfront-buttonfront-pocketdenim-bluefull-1421526313681j3qsz.png" },
    { color: "green", imageUrl: "http://5.imimg.com/data5/SELLER/Default/2024/2/388633951/XP/BZ/DE/15946523/dark-blue-plaint-t-shirt-1000x1000.jpg" },
    { color: "black", imageUrl: "https://tse1.mm.bing.net/th?id=OIP.AHykd4gwINedzbavUhyeLwHaHa&pid=Api&P=0&h=180" },
  ];

  // Use hovered image if available, otherwise fall back to product image 
  const displayImage = hoveredImage || product.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop";

  const handleCardClick = (e: React.MouseEvent) => {
    // Only open modal if not clicking on color swatches
    if (!(e.target as HTMLElement).closest('.color-swatch')) {
      onProductClick(product);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer" onClick={handleCardClick}>
      <div className="relative">
        <img
          src={displayImage}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
        />
        {!product.isActive && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      <CardContent className="p-6">
        <h3 className="font-semibold text-gray-900 mb-2">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {product.description}
        </p>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">
              ₹{product.sellingPrice || product.price}
            </span>
            {product.mrp &&
              parseFloat(product.mrp) >
                parseFloat(product.sellingPrice || product.price) && (
                <span className="text-lg text-gray-500 line-through">
                  ₹{product.mrp}
                </span>
              )}
          </div>

          {/* Color Swatches */}
          <div className="flex gap-2 mb-4 color-swatch">
            {colorOptions.map((option) => (
              <div
                key={option.color}
                className="w-6 h-6 rounded-full cursor-pointer border border-gray-300 hover:ring-2 hover:ring-primary transition-all"
                style={{ backgroundColor: option.color }}
                onMouseEnter={() => setHoveredImage(option.imageUrl)}
                onMouseLeave={() => setHoveredImage(null)}
                title={`${option.color} variant`}
              />
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            disabled={!product.isActive}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Storefront() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [guestCart, setGuestCartState] = useState<CartItem[]>([]);
  const [hasAttemptedMerge, setHasAttemptedMerge] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Load guest cart on component mount
  useEffect(() => {
    setGuestCartState(getGuestCart());
  }, []);

  // Fetch products without authentication requirement
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    // Remove authentication requirement for viewing products
  });

  // Fetch user cart only if authenticated
  const { data: userCartItems = [], refetch: refetchCart } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
    enabled: !!user && isAuthenticated,
  });

  // Merge guest cart with user cart after login
  useEffect(() => {
    if (isAuthenticated && user && !hasAttemptedMerge && guestCart.length > 0) {
      const mergeGuestCartWithUser = async () => {
        try {
          // Send guest cart items to server to merge with user cart
          for (const item of guestCart) {
            await apiRequest("POST", "/api/cart", { 
              productId: item.product.id, 
              quantity: item.quantity,
              selectedColor: item.selectedColor,
              selectedSize: item.selectedSize
            });
          }
          
          // Clear guest cart after successful merge
          clearGuestCart();
          setGuestCartState([]);
          
          // Refresh user cart
          await refetchCart();
          
          toast({
            title: "Cart merged",
            description: "Your guest cart items have been added to your account",
          });
        } catch (error) {
          console.error('Failed to merge guest cart:', error);
          toast({
            title: "Cart merge failed",
            description: "Some items might not have been transferred",
            variant: "destructive",
          });
        } finally {
          setHasAttemptedMerge(true);
        }
      };

      mergeGuestCartWithUser();
    }
  }, [isAuthenticated, user, guestCart, hasAttemptedMerge, refetchCart, toast]);

  // Add to cart mutation that handles both guest and authenticated users
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, color, size }: { productId: number; color: string; size: string }) => {
      if (!isAuthenticated || !user) {
        // Handle guest cart
        const product = products.find(p => p.id === productId);
        if (!product) throw new Error('Product not found');
        
        const currentGuestCart = getGuestCart();
        const existingItemIndex = currentGuestCart.findIndex(
          item => item.product.id === productId && 
                  item.selectedColor === color && 
                  item.selectedSize === size
        );
        
        let updatedCart;
        if (existingItemIndex !== -1) {
          // Update quantity if item already exists with same color/size
          updatedCart = currentGuestCart.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          // Add new item to cart
          const newItem: CartItem = {
            id: Date.now(), // Temporary ID for guest cart
            quantity: 1,
            product: product,
            selectedColor: color,
            selectedSize: size
          };
          updatedCart = [...currentGuestCart, newItem];
        }
        
        setGuestCart(updatedCart);
        setGuestCartState(updatedCart);
        return;
      }
      
      // Handle authenticated user cart
      await apiRequest("POST", "/api/cart", { 
        productId, 
        quantity: 1,
        selectedColor: color,
        selectedSize: size
      });
    },
    onSuccess: () => {
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      }
      toast({
        title: "Added to cart",
        description: "Product added to your cart successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add product to cart",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = (productId: number, color: string, size: string) => {
    addToCartMutation.mutate({ productId, color, size });
    setIsProductModalOpen(false);
  };

  const handleBuyNow = (productId: number, color: string, size: string) => {
    addToCartMutation.mutate({ productId, color, size });
    setIsProductModalOpen(false);
    setTimeout(() => {
      setIsCheckoutOpen(true);
    }, 500);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  // Calculate cart item count from appropriate cart
  const currentCartItems = isAuthenticated ? userCartItems : guestCart;
  const cartItemCount = currentCartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Group products by vendor for better organization
  const productsByVendor = products.reduce((acc: Record<string, Product[]>, product) => {
    const vendorName = product.vendor?.name || "Unknown Store";
    if (!acc[vendorName]) {
      acc[vendorName] = [];
    }
    acc[vendorName].push(product);
    return acc;
  }, {});

  // Get unique stores with their details
  const stores = Object.entries(productsByVendor).map(
    ([vendorName, products]) => {
      const vendor = products[0]?.vendor;
      return {
        id: vendor?.id,
        name: vendorName,
        logo: vendor?.logo,
        rating: vendor?.rating || 4.5, // Default rating if not available
        productCount: products.length,
        products: products,
      };
    }
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <h1 className="text-xl font-bold text-gray-900 cursor-pointer">
                SaaSCommerce
              </h1>
            </Link>
            <div className="flex items-center space-x-4">
              {/* Show cart for both authenticated and guest users */}
              <div
                className="relative cursor-pointer"
                onClick={() => setIsCartOpen(true)}
              >
                <div className="relative">
                  <svg className="w-6 h-6 text-gray-600 hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.68 6.32a1 1 0 00.95 1.32h9.46a1 1 0 00.95-1.32L15 13H7z" />
                  </svg>
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </div>
              </div>
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.profileImageUrl || undefined} />
                    <AvatarFallback>
                      {user?.firstName?.[0] || user?.email?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-700">
                    {user?.firstName || user?.email}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {window.location.href = "/api/logout"}}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => (window.location.href = "/landing")}
                  size="sm"
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative">
        <div
          className="h-96 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=600')",
          }}
        >
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
              <h1 className="text-5xl font-bold mb-4">Premium Marketplace</h1>
              <p className="text-xl mb-8">
                Discover amazing products from top vendors
              </p>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90"
                onClick={() => {
                  document
                    .getElementById("products")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Shop Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stores Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Browse Stores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stores.map((store) => (
              <Card
                key={store.id}
                className="overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                      {store.logo ? (
                        <img
                          src={store.logo}
                          alt={store.name}
                          className="w-12 h-12 object-contain"
                        />
                      ) : (
                        <Store className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {store.name}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="ml-1">
                            {store.rating.toFixed(1)}
                          </span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center">
                          <Package className="w-4 h-4" />
                          <span className="ml-1">
                            {store.productCount} products
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {store.products.slice(0, 4).map((product) => (
                      <img
                        key={product.id}
                        src={
                          product.imageUrl ||
                          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop"
                        }
                        alt={product.name}
                        className="w-full h-24 object-cover rounded-md"
                      />
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      document
                        .getElementById(`store-${store.id}`)
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    View Store
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Product Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Featured Categories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center group cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1484704849700-f032a568e944?w=300&h=200&fit=crop"
              alt="Electronics"
              className="w-full h-48 rounded-lg object-cover group-hover:scale-105 transition-transform"
            />
            <h3 className="text-xl font-semibold text-gray-900 mt-4">
              Electronics
            </h3>
            <p className="text-gray-600">Latest gadgets and tech</p>
          </div>
          <div className="text-center group cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop"
              alt="Fashion"
              className="w-full h-48 rounded-lg object-cover group-hover:scale-105 transition-transform"
            />
            <h3 className="text-xl font-semibold text-gray-900 mt-4">
              Fashion
            </h3>
            <p className="text-gray-600">Trendy clothing and accessories</p>
          </div>
          <div className="text-center group cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop"
              alt="Home & Garden"
              className="w-full h-48 rounded-lg object-cover group-hover:scale-105 transition-transform"
            />
            <h3 className="text-xl font-semibold text-gray-900 mt-4">
              Home & Garden
            </h3>
            <p className="text-gray-600">Furniture and decor</p>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div id="products" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            All Products
          </h2>

          {productsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-box-open text-gray-400 text-6xl mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Products Available
              </h3>
              <p className="text-gray-600">
                Check back later for new products!
              </p>
            </div>
          ) : (
            Object.entries(productsByVendor).map(
              ([vendorName, vendorProducts]) => (
                <div
                  key={vendorName}
                  id={`store-${vendorProducts[0]?.vendor?.id}`}
                  className="mb-12 scroll-mt-16"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {vendorName}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="ml-1">
                          {vendorProducts[0]?.vendor?.rating?.toFixed(1) ||
                            "4.5"}
                        </span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center">
                        <Package className="w-4 h-4" />
                        <span className="ml-1">
                          {vendorProducts.length} products
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {vendorProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onProductClick={handleProductClick}
                      />
                    ))}
                  </div>
                </div>
              )
            )
          )}
        </div>
      </div>

      {/* Product Selection Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        isLoading={addToCartMutation.isPending}
      />

      {/* Shopping Cart Sidebar */}
      <ShoppingCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          if (!isAuthenticated) {
            // Redirect to login if trying to checkout as guest
            toast({
              title: "Login Required",
              description: "Please login to proceed with checkout",
              variant: "destructive",
            });
            window.location.href = "/landing";
            return;
          }
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        cartItems={currentCartItems}
        refetchCart={isAuthenticated ? refetchCart : () => setGuestCartState(getGuestCart())}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={currentCartItems}
        onOrderComplete={() => {
          setIsCheckoutOpen(false);
          if (isAuthenticated) {
            refetchCart();
          } else {
            clearGuestCart();
            setGuestCartState([]);
          }
        }}
      />
    </div>
  );
}