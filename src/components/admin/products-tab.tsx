import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  useListProducts,
  productsQueryKey,
  useAdminCreateProduct,
  useAdminUpdateProduct,
  useAdminDeleteProduct,
} from '@/lib/api/products';
import { useListCategories } from '@/lib/api/categories';
import { PRODUCT_TAGS, type Product } from '@/lib/api/types';
import { ImageUploadField } from '@/components/admin/image-upload-field';
import { formatPrice } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ProductFormState {
  categoryId: string;
  name: string;
  description: string;
  price: string;
  discountPrice: string;
  imageUrl: string;
  tags: string[];
}

const emptyForm: ProductFormState = {
  categoryId: '',
  name: '',
  description: '',
  price: '',
  discountPrice: '',
  imageUrl: '',
  tags: [],
};

export function AdminProductsTab() {
  const queryClient = useQueryClient();
  const { data: products, isLoading } = useListProducts();
  const { data: categories } = useListCategories();
  const createMutation = useAdminCreateProduct();
  const updateMutation = useAdminUpdateProduct();
  const deleteMutation = useAdminDeleteProduct();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Product | null>(null);
  const [form, setForm] = React.useState<ProductFormState>(emptyForm);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: productsQueryKey() });

  const categoryName = (id: string) => categories?.find((c) => c.id === id)?.name ?? 'Unknown';

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, categoryId: categories?.[0]?.id ?? '' });
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      categoryId: product.categoryId,
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      discountPrice: product.discountPrice != null ? product.discountPrice.toString() : '',
      imageUrl: product.imageUrl,
      tags: product.tags,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      categoryId: form.categoryId,
      name: form.name,
      description: form.description,
      price: Number(form.price),
      discountPrice: form.discountPrice.trim() === '' ? null : Number(form.discountPrice),
      imageUrl: form.imageUrl,
      tags: form.tags,
    };

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data });
        toast.success('Product updated');
      } else {
        await createMutation.mutateAsync({ data });
        toast.success('Product created');
      }
      await invalidate();
      setDialogOpen(false);
    } catch {
      toast.error('Something went wrong');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync({ id });
      await invalidate();
      toast.success('Product deleted');
    } catch {
      toast.error('Could not delete product');
    }
  };

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-serif font-bold">Products</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} disabled={!categories?.length} data-testid="button-add-product">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Product' : 'New Product'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prod-category">Category</Label>
                <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                  <SelectTrigger id="prod-category" data-testid="select-product-category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prod-name">Name</Label>
                <Input
                  id="prod-name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  data-testid="input-product-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prod-description">Description</Label>
                <Textarea
                  id="prod-description"
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  data-testid="input-product-description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prod-price">Price</Label>
                  <Input
                    id="prod-price"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    data-testid="input-product-price"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prod-discount">Discount price (optional)</Label>
                  <Input
                    id="prod-discount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.discountPrice}
                    onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
                    data-testid="input-product-discount-price"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Image</Label>
                <ImageUploadField
                  value={form.imageUrl}
                  onChange={(url) => setForm({ ...form, imageUrl: url })}
                  testId="input-product-image"
                />
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <p className="text-xs text-muted-foreground">
                  Controls which homepage row this product appears in.
                </p>
                <ToggleGroup
                  type="multiple"
                  variant="outline"
                  value={form.tags}
                  onValueChange={(tags: string[]) => setForm({ ...form, tags })}
                  className="justify-start"
                  data-testid="input-product-tags"
                >
                  {PRODUCT_TAGS.map((tag) => (
                    <ToggleGroupItem key={tag} value={tag} className="capitalize px-4">
                      {tag}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={saving || !form.categoryId || !form.imageUrl} data-testid="button-save-product">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-background rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && products?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No products yet.
                </TableCell>
              </TableRow>
            )}
            {products?.map((product) => (
              <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="text-muted-foreground">{categoryName(product.categoryId)}</TableCell>
                <TableCell>
                  {product.discountPrice != null ? (
                    <span>
                      <span className="line-through text-muted-foreground mr-1">
                        {formatPrice(product.price)}
                      </span>
                      {formatPrice(product.discountPrice)}
                    </span>
                  ) : (
                    formatPrice(product.price)
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(product)} data-testid={`button-edit-product-${product.id}`}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" data-testid={`button-delete-product-${product.id}`}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete product?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{product.name}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(product.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
