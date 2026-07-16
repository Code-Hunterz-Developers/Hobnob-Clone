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
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

type AdminProductManagerProps = {
  title: string;
  addLabel: string;
  description?: string;
  fixedCategorySlug?: string;
  fixedTags?: string[];
  visibleTags?: string[];
  productFilter?: (product: Product) => boolean;
  emptyMessage?: string;
};

export function AdminProductManager({
  title,
  addLabel,
  description,
  fixedCategorySlug,
  fixedTags = [],
  visibleTags = PRODUCT_TAGS.filter((tag) => !fixedTags.includes(tag)),
  productFilter,
  emptyMessage = 'No products yet.',
}: AdminProductManagerProps) {
  const queryClient = useQueryClient();
  const { data: products, isLoading } = useListProducts();
  const { data: categories } = useListCategories();
  const createMutation = useAdminCreateProduct();
  const updateMutation = useAdminUpdateProduct();
  const deleteMutation = useAdminDeleteProduct();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Product | null>(null);
  const [form, setForm] = React.useState<ProductFormState>(emptyForm);

  const fixedCategory = categories?.find((category) => category.slug === fixedCategorySlug);
  const listedProducts = React.useMemo(() => {
    const base = products ?? [];
    return productFilter ? base.filter(productFilter) : base;
  }, [productFilter, products]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: productsQueryKey() });

  const categoryName = (id: string) =>
    categories?.find((category) => category.id === id)?.name ?? 'Unknown';

  const withFixedTags = (tags: string[]) =>
    Array.from(new Set([...tags, ...fixedTags]));

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...emptyForm,
      categoryId: fixedCategory?.id ?? categories?.[0]?.id ?? '',
      tags: withFixedTags([]),
    });
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      categoryId: fixedCategory?.id ?? product.categoryId,
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      discountPrice:
        product.discountPrice != null ? product.discountPrice.toString() : '',
      imageUrl: product.imageUrl,
      tags: withFixedTags(product.tags.filter((tag) => !fixedTags.includes(tag))),
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const categoryId = fixedCategory?.id ?? form.categoryId;
    const data = {
      categoryId,
      name: form.name,
      description: form.description,
      price: Number(form.price),
      discountPrice:
        form.discountPrice.trim() === '' ? null : Number(form.discountPrice),
      imageUrl: form.imageUrl,
      tags: withFixedTags(form.tags),
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
  const disableCreate = fixedCategorySlug ? !fixedCategory : !categories?.length;

  return (
    <div>
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-primary">{title}</h2>
          {description ? (
            <p className="text-sm text-foreground/75 mt-1">{description}</p>
          ) : null}
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openCreate}
              disabled={disableCreate}
              data-testid={`button-add-${title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Plus className="w-4 h-4 mr-2" />
              {addLabel}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? `Edit ${title}` : addLabel}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {fixedCategory ? (
                <div className="space-y-2">
                  <Label>Category</Label>
                  <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm font-medium">
                    {fixedCategory.name}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="prod-category">Category</Label>
                  <Select
                    value={form.categoryId}
                    onValueChange={(value) => setForm({ ...form, categoryId: value })}
                  >
                    <SelectTrigger id="prod-category" data-testid="select-product-category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
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
                    onChange={(e) =>
                      setForm({ ...form, discountPrice: e.target.value })
                    }
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
                  Controls which sections this product appears in.
                </p>
                <ToggleGroup
                  type="multiple"
                  variant="outline"
                  value={form.tags}
                  onValueChange={(tags: string[]) => setForm({ ...form, tags })}
                  className="justify-start flex-wrap"
                  data-testid="input-product-tags"
                >
                  {visibleTags.map((tag) => (
                    <ToggleGroupItem key={tag} value={tag} className="capitalize px-4">
                      {tag.replace('-', ' ')}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                {fixedTags.length > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Fixed tags applied automatically: {fixedTags.join(', ')}.
                  </p>
                ) : null}
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={saving || !(fixedCategory?.id ?? form.categoryId) || !form.imageUrl}
                  data-testid="button-save-product"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card/95 rounded-2xl border border-border shadow-lg shadow-black/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-foreground">Name</TableHead>
              <TableHead className="text-foreground">Category</TableHead>
              <TableHead className="text-foreground">Price</TableHead>
              <TableHead className="text-right text-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : null}
            {!isLoading && listedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : null}
            {listedProducts.map((product) => (
              <TableRow key={product.id} data-testid={`row-product-${product.id}`} className="border-border/80">
                <TableCell className="font-medium text-foreground">{product.name}</TableCell>
                <TableCell className="text-foreground/80">
                  {categoryName(product.categoryId)}
                </TableCell>
                <TableCell className="text-foreground">
                  {product.discountPrice != null ? (
                    <span>
                      <span className="line-through text-foreground/55 mr-1">
                        {formatPrice(product.price)}
                      </span>
                      {formatPrice(product.discountPrice)}
                    </span>
                  ) : (
                    formatPrice(product.price)
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-foreground/75 hover:text-foreground hover:bg-muted/70"
                    onClick={() => openEdit(product)}
                    data-testid={`button-edit-product-${product.id}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-muted/70"
                        data-testid={`button-delete-product-${product.id}`}
                      >
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
