import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { ProductVariantMatrix } from "@/components/product-variant-matrix";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { X, Plus, Package, Palette, Ruler } from "lucide-react";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  sku: z.string().min(1, "SKU is required"),
  mrp: z.string().min(1, "MRP is required"),
  sellingPrice: z.string().min(1, "Selling price is required"),
  purchasePrice: z.string().min(1, "Purchase price is required"),
  weight: z.string().min(1, "Weight is required"),
  length: z.string().min(1, "Length is required"),
  breadth: z.string().min(1, "Breadth is required"),
  height: z.string().min(1, "Height is required"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  categoryId: z.string().optional(),
  stock: z.string().optional(),
  status: z.string().default("active"),
});

interface ProductVariant {
  id?: string;
  sku: string;
  color: string;
  size: string;
  mrp: string;
  sellingPrice: string;
  purchasePrice: string;
  stock: string;
  weight: string;
  length: string;
  breadth: string;
  height: string;
  imageUrls: string[];
}

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any;
  vendorId?: number;
}

export function ProductForm({
  isOpen,
  onClose,
  product,
  vendorId,
}: ProductFormProps) {
  const { toast } = useToast();
  const [selectedParentCategory, setSelectedParentCategory] =
    useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [activeTab, setActiveTab] = useState("basic");
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [customColor, setCustomColor] = useState("");
  const [customSize, setCustomSize] = useState("");

  // Predefined options
  const predefinedColors = [
    "Red",
    "Blue",
    "Green",
    "Black",
    "White",
    "Yellow",
    "Purple",
    "Orange",
    "Pink",
    "Gray",
  ];
  const predefinedSizes = [
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
    "XXXL",
    "Free Size",
  ];

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
    enabled: isOpen,
  });

  // Get parent categories (those without parentId)
  const parentCategories = (categories as any[]).filter(
    (cat: any) => !cat.parentId
  );

  // Get subcategories for selected parent
  const subcategories = selectedParentCategory
    ? (categories as any[]).filter(
        (cat: any) => cat.parentId === parseInt(selectedParentCategory)
      )
    : [];

  // Initialize form with product data or defaults
  useEffect(() => {
    if (product && isOpen) {
      setHasVariants(!!product.variants && product.variants.length > 0);
      if (product.variants && product.variants.length > 0) {
        setVariants(product.variants);
        // Extract unique colors and sizes from existing variants
        const colorSet = new Set<string>();
        const sizeSet = new Set<string>();
        product.variants.forEach((v: any) => {
          colorSet.add(v.color);
          sizeSet.add(v.size);
        });
        const colors = Array.from(colorSet);
        const sizes = Array.from(sizeSet);
        setSelectedColors(colors);
        setSelectedSizes(sizes);
      }
    }
  }, [product, isOpen]);

  // Generate variant matrix when colors or sizes change
  const generateVariantMatrix = () => {
    if (selectedColors.length === 0 || selectedSizes.length === 0) {
      setVariants([]);
      return;
    }

    const newVariants: ProductVariant[] = [];
    const baseValues = form.getValues();

    selectedColors.forEach((color) => {
      selectedSizes.forEach((size) => {
        const existingVariant = variants.find(
          (v) => v.color === color && v.size === size
        );

        newVariants.push({
          id: existingVariant?.id,
          sku:
            existingVariant?.sku ||
            `${baseValues.sku}-${color.toUpperCase()}-${size}`,
          color,
          size,
          mrp: existingVariant?.mrp || baseValues.mrp,
          sellingPrice:
            existingVariant?.sellingPrice || baseValues.sellingPrice,
          purchasePrice:
            existingVariant?.purchasePrice || baseValues.purchasePrice,
          stock: existingVariant?.stock || "0",
          weight: existingVariant?.weight || baseValues.weight,
          length: existingVariant?.length || baseValues.length,
          breadth: existingVariant?.breadth || baseValues.breadth,
          height: existingVariant?.height || baseValues.height,
          imageUrls: existingVariant?.imageUrls || [],
        });
      });
    });

    setVariants(newVariants);
  };

  // Add custom color
  const addCustomColor = () => {
    if (customColor.trim() && !selectedColors.includes(customColor.trim())) {
      setSelectedColors([...selectedColors, customColor.trim()]);
      setCustomColor("");
    }
  };

  // Add custom size
  const addCustomSize = () => {
    if (customSize.trim() && !selectedSizes.includes(customSize.trim())) {
      setSelectedSizes([...selectedSizes, customSize.trim()]);
      setCustomSize("");
    }
  };

  // Remove color
  const removeColor = (color: string) => {
    setSelectedColors(selectedColors.filter((c) => c !== color));
  };

  // Remove size
  const removeSize = (size: string) => {
    setSelectedSizes(selectedSizes.filter((s) => s !== size));
  };

  // Update variant matrix when selections change
  useEffect(() => {
    if (hasVariants) {
      generateVariantMatrix();
    }
  }, [selectedColors, selectedSizes, hasVariants]);

  // Handle variant changes from matrix
  const handleVariantsChange = (updatedVariants: ProductVariant[]) => {
    setVariants(updatedVariants);
  };

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      sku: product?.sku || "",
      mrp: product?.mrp || "",
      sellingPrice: product?.sellingPrice || "",
      purchasePrice: product?.purchasePrice || "",
      weight: product?.weight || "",
      length: product?.length || "",
      breadth: product?.breadth || "",
      height: product?.height || "",
      imageUrl: product?.imageUrl || "",
      categoryId: product?.categoryId?.toString() || "",
      stock: product?.stock?.toString() || "0",
      status: product?.status || "active",
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      if (product) {
        await apiRequest("PUT", `/api/products/${product.id}`, productData);
      } else {
        await apiRequest("POST", "/api/products", productData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: `Product ${product ? "updated" : "created"} successfully`,
      });
      onClose();
      form.reset();
      setVariants([]);
      setSelectedColors([]);
      setSelectedSizes([]);
      setHasVariants(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${product ? "update" : "create"} product`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: z.infer<typeof productSchema>) => {
    const productData = {
      ...data,
      mrp: parseFloat(data.mrp),
      sellingPrice: parseFloat(data.sellingPrice),
      purchasePrice: parseFloat(data.purchasePrice),
      weight: parseFloat(data.weight),
      length: parseFloat(data.length),
      breadth: parseFloat(data.breadth),
      height: parseFloat(data.height),
      stock: parseInt(data.stock || "0"),
      categoryId: data.categoryId ? parseInt(data.categoryId) : null,
      vendorId,
      hasVariants,
      variants: hasVariants
        ? variants.map((v) => ({
            ...v,
            mrp: parseFloat(v.mrp),
            sellingPrice: parseFloat(v.sellingPrice),
            purchasePrice: parseFloat(v.purchasePrice),
            stock: parseInt(v.stock),
            weight: parseFloat(v.weight),
            length: parseFloat(v.length),
            breadth: parseFloat(v.breadth),
            height: parseFloat(v.height),
          }))
        : undefined,
    };

    createProductMutation.mutate(productData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-screen overflow-y-auto">
        <CardHeader className="border-b border-gray-200">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              {product ? "Edit Product" : "Add New Product"}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Information</TabsTrigger>
                  <TabsTrigger value="variants">Product Variants</TabsTrigger>
                  <TabsTrigger value="specifications">
                    Specifications
                  </TabsTrigger>
                </TabsList>

                {/* Basic Information Tab */}
                <TabsContent value="basic" className="space-y-6 mt-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Name *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter product name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="sku"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SKU *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., PROD-001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description *</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={4}
                              placeholder="Describe your product..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                          value={selectedParentCategory}
                          onValueChange={setSelectedParentCategory}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select parent category" />
                          </SelectTrigger>
                          <SelectContent>
                            {parentCategories.map((category: any) => (
                              <SelectItem
                                key={category.id}
                                value={category.id.toString()}
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedParentCategory && subcategories.length > 0 && (
                        <FormField
                          control={form.control}
                          name="categoryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subcategory</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select subcategory" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {subcategories.map((category: any) => (
                                    <SelectItem
                                      key={category.id}
                                      value={category.id.toString()}
                                    >
                                      {category.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Image URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com/image.jpg"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Variant Toggle */}
                    <div className="flex items-center space-x-2 p-4 border rounded-lg bg-gray-50">
                      <Checkbox
                        id="hasVariants"
                        checked={hasVariants}
                        onCheckedChange={(checked) =>
                          setHasVariants(checked === true)
                        }
                      />
                      <Label htmlFor="hasVariants" className="font-medium">
                        This product has variants (colors, sizes, etc.)
                      </Label>
                    </div>
                  </div>
                </TabsContent>

                {/* Product Variants Tab */}
                <TabsContent value="variants" className="space-y-6 mt-6">
                  {!hasVariants ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No Variants Enabled
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Enable variants in the Basic Information tab to create
                        product variations
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setHasVariants(true);
                          setActiveTab("basic");
                        }}
                      >
                        Enable Variants
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Color Selection */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Palette className="w-5 h-5" />
                            Colors
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                            {predefinedColors.map((color) => (
                              <div
                                key={color}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`color-${color}`}
                                  checked={selectedColors.includes(color)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedColors([
                                        ...selectedColors,
                                        color,
                                      ]);
                                    } else {
                                      removeColor(color);
                                    }
                                  }}
                                />
                                <Label
                                  htmlFor={`color-${color}`}
                                  className="text-sm"
                                >
                                  {color}
                                </Label>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-2">
                            <Input
                              placeholder="Custom color"
                              value={customColor}
                              onChange={(e) => setCustomColor(e.target.value)}
                              onKeyPress={(e) =>
                                e.key === "Enter" && addCustomColor()
                              }
                            />
                            <Button
                              type="button"
                              onClick={addCustomColor}
                              size="sm"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>

                          {selectedColors.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {selectedColors.map((color) => (
                                <Badge
                                  key={color}
                                  variant="secondary"
                                  className="flex items-center gap-1"
                                >
                                  {color}
                                  <X
                                    className="w-3 h-3 cursor-pointer"
                                    onClick={() => removeColor(color)}
                                  />
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Size Selection */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Ruler className="w-5 h-5" />
                            Sizes
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {predefinedSizes.map((size) => (
                              <div
                                key={size}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`size-${size}`}
                                  checked={selectedSizes.includes(size)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedSizes([
                                        ...selectedSizes,
                                        size,
                                      ]);
                                    } else {
                                      removeSize(size);
                                    }
                                  }}
                                />
                                <Label
                                  htmlFor={`size-${size}`}
                                  className="text-sm"
                                >
                                  {size}
                                </Label>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-2">
                            <Input
                              placeholder="Custom size"
                              value={customSize}
                              onChange={(e) => setCustomSize(e.target.value)}
                              onKeyPress={(e) =>
                                e.key === "Enter" && addCustomSize()
                              }
                            />
                            <Button
                              type="button"
                              onClick={addCustomSize}
                              size="sm"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>

                          {selectedSizes.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {selectedSizes.map((size) => (
                                <Badge
                                  key={size}
                                  variant="secondary"
                                  className="flex items-center gap-1"
                                >
                                  {size}
                                  <X
                                    className="w-3 h-3 cursor-pointer"
                                    onClick={() => removeSize(size)}
                                  />
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Variant Matrix */}
                      {selectedColors.length > 0 &&
                        selectedSizes.length > 0 && (
                          <Card>
                            <CardHeader>
                              <CardTitle>Variant Matrix</CardTitle>
                              <p className="text-sm text-gray-600">
                                Configure pricing, stock, and specifications for
                                each variant combination
                              </p>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="overflow-x-auto">
                                  <table className="w-full border-collapse">
                                    <thead>
                                      <tr className="bg-gray-50">
                                        <th className="border p-2 text-left">
                                          Color
                                        </th>
                                        <th className="border p-2 text-left">
                                          Size
                                        </th>
                                        <th className="border p-2 text-left">
                                          SKU
                                        </th>
                                        <th className="border p-2 text-left">
                                          MRP (₹)
                                        </th>
                                        <th className="border p-2 text-left">
                                          Selling Price (₹)
                                        </th>
                                        <th className="border p-2 text-left">
                                          Stock
                                        </th>
                                        <th className="border p-2 text-left">
                                          Weight (kg)
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {variants.map((variant, index) => (
                                        <tr
                                          key={`${variant.color}-${variant.size}`}
                                        >
                                          <td className="border p-2 font-medium">
                                            {variant.color}
                                          </td>
                                          <td className="border p-2 font-medium">
                                            {variant.size}
                                          </td>
                                          <td className="border p-2">
                                            <Input
                                              value={variant.sku}
                                              onChange={(e) => {
                                                const updatedVariants = [
                                                  ...variants,
                                                ];
                                                updatedVariants[index].sku =
                                                  e.target.value;
                                                setVariants(updatedVariants);
                                              }}
                                              className="min-w-32"
                                            />
                                          </td>
                                          <td className="border p-2">
                                            <Input
                                              type="number"
                                              step="0.01"
                                              value={variant.mrp}
                                              onChange={(e) => {
                                                const updatedVariants = [
                                                  ...variants,
                                                ];
                                                updatedVariants[index].mrp =
                                                  e.target.value;
                                                setVariants(updatedVariants);
                                              }}
                                              className="min-w-24"
                                            />
                                          </td>
                                          <td className="border p-2">
                                            <Input
                                              type="number"
                                              step="0.01"
                                              value={variant.sellingPrice}
                                              onChange={(e) => {
                                                const updatedVariants = [
                                                  ...variants,
                                                ];
                                                updatedVariants[
                                                  index
                                                ].sellingPrice = e.target.value;
                                                setVariants(updatedVariants);
                                              }}
                                              className="min-w-24"
                                            />
                                          </td>
                                          <td className="border p-2">
                                            <Input
                                              type="number"
                                              value={variant.stock}
                                              onChange={(e) => {
                                                const updatedVariants = [
                                                  ...variants,
                                                ];
                                                updatedVariants[index].stock =
                                                  e.target.value;
                                                setVariants(updatedVariants);
                                              }}
                                              className="min-w-20"
                                            />
                                          </td>
                                          <td className="border p-2">
                                            <Input
                                              type="number"
                                              step="0.01"
                                              value={variant.weight}
                                              onChange={(e) => {
                                                const updatedVariants = [
                                                  ...variants,
                                                ];
                                                updatedVariants[index].weight =
                                                  e.target.value;
                                                setVariants(updatedVariants);
                                              }}
                                              className="min-w-20"
                                            />
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>

                                {variants.length > 0 && (
                                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                                    <span className="text-sm text-blue-800">
                                      {variants.length} variants generated from{" "}
                                      {selectedColors.length} colors ×{" "}
                                      {selectedSizes.length} sizes
                                    </span>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const baseValues = form.getValues();
                                        const updatedVariants = variants.map(
                                          (v) => ({
                                            ...v,
                                            mrp: baseValues.mrp,
                                            sellingPrice:
                                              baseValues.sellingPrice,
                                            purchasePrice:
                                              baseValues.purchasePrice,
                                            weight: baseValues.weight,
                                            length: baseValues.length,
                                            breadth: baseValues.breadth,
                                            height: baseValues.height,
                                          })
                                        );
                                        setVariants(updatedVariants);
                                      }}
                                    >
                                      Apply Base Values to All
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                    </div>
                  )}
                </TabsContent>

                {/* Specifications Tab */}
                <TabsContent value="specifications" className="space-y-6 mt-6">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Pricing Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="mrp"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>MRP (₹) *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="sellingPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Selling Price (₹) *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="purchasePrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Purchase Price (₹) *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Physical Specifications
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <FormField
                          control={form.control}
                          name="weight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Weight (kg) *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="length"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Length (cm) *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.1"
                                  placeholder="0.0"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="breadth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Breadth (cm) *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.1"
                                  placeholder="0.0"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="height"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Height (cm) *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.1"
                                  placeholder="0.0"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {!hasVariants && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Stock Information
                        </h3>
                        <FormField
                          control={form.control}
                          name="stock"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Stock Quantity</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createProductMutation.isPending}
                >
                  {createProductMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      {product ? "Updating..." : "Creating..."}
                    </>
                  ) : product ? (
                    "Update Product"
                  ) : (
                    "Create Product"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
