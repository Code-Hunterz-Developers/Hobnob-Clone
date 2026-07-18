import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  useListCategories,
  categoriesQueryKey,
  useAdminCreateCategory,
  useAdminUpdateCategory,
  useAdminDeleteCategory,
} from '@/lib/api/categories';
import type { Category, CategoryInput } from '@/lib/api/types';
import { ImageUploadField } from '@/components/admin/image-upload-field';
import { BulkUploadDialog, type BulkUploadColumn } from '@/components/admin/bulk-upload-dialog';
import { slugify } from '@/lib/csv';
import { processImage } from '@/lib/api/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
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

interface CategoryFormState {
  name: string;
  slug: string;
  imageUrl: string;
}

const emptyForm: CategoryFormState = { name: '', slug: '', imageUrl: '' };

export function AdminCategoriesTab() {
  const queryClient = useQueryClient();
  const { data: categories, isLoading } = useListCategories();
  const createMutation = useAdminCreateCategory();
  const updateMutation = useAdminUpdateCategory();
  const deleteMutation = useAdminDeleteCategory();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Category | null>(null);
  const [form, setForm] = React.useState<CategoryFormState>(emptyForm);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: categoriesQueryKey() });

  const bulkColumns: BulkUploadColumn[] = [
    { key: 'name', label: 'Name', required: true },
    { key: 'slug', label: 'Slug', hint: 'optional — auto-generated from name if left blank' },
    { key: 'image', label: 'Image', hint: 'optional — exact filename of an image uploaded in step 2, e.g. cakes.jpg' },
  ];

  type BulkCategoryRow = Omit<CategoryInput, 'imageUrl'> & { imageFile?: File };

  const parseBulkRow = (raw: Record<string, string>, imageFile: File | undefined): BulkCategoryRow => {
    const name = raw.name?.trim();
    if (!name) throw new Error('Name is required');

    const slugRaw = raw.slug?.trim();
    const slug = slugRaw ? slugify(slugRaw) : slugify(name);
    if (!slug) throw new Error('Could not derive a slug from the name');

    return {
      name,
      slug,
      imageFile,
    };
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setForm({ name: category.name, slug: category.slug, imageUrl: category.imageUrl });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data: form });
        toast.success('Category updated');
      } else {
        await createMutation.mutateAsync({ data: form });
        toast.success('Category created');
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
      toast.success('Category deleted');
    } catch {
      toast.error('Could not delete category');
    }
  };

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-serif font-bold text-primary">Categories</h2>
        <div className="flex items-center gap-2">
        <BulkUploadDialog<BulkCategoryRow>
          entityLabel="Categories"
          columns={bulkColumns}
          templateFilename="categories-template.csv"
          templateExampleRow={['Cakes', 'cakes', 'cakes.jpg']}
          imageColumnKey="image"
          parseRow={parseBulkRow}
          getRowLabel={(raw) => raw.name ?? ''}
          createRow={async ({ imageFile, ...data }) => {
            const imageUrl = imageFile ? await processImage(imageFile) : '';
            await createMutation.mutateAsync({ data: { ...data, imageUrl } });
          }}
          onComplete={invalidate}
        />
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} data-testid="button-add-category">
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Category' : 'New Category'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cat-name">Name</Label>
                <Input
                  id="cat-name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  data-testid="input-category-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-slug">Slug</Label>
                <Input
                  id="cat-slug"
                  required
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  data-testid="input-category-slug"
                />
              </div>
              <div className="space-y-2">
                <Label>Image (optional)</Label>
                <p className="text-xs text-muted-foreground">
                  Shown as the background on the homepage category tile and category page banner. Looks fine without one too.
                </p>
                <ImageUploadField
                  value={form.imageUrl}
                  onChange={(url) => setForm({ ...form, imageUrl: url })}
                  testId="input-category-image"
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={saving} data-testid="button-save-category">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="bg-card/95 rounded-2xl border border-border shadow-lg shadow-black/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-foreground">Name</TableHead>
              <TableHead className="text-foreground">Slug</TableHead>
              <TableHead className="text-right text-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && categories?.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  No categories yet.
                </TableCell>
              </TableRow>
            )}
            {categories?.map((category) => (
              <TableRow key={category.id} data-testid={`row-category-${category.id}`} className="border-border/80">
                <TableCell className="font-medium text-foreground">{category.name}</TableCell>
                <TableCell className="text-foreground/80">{category.slug}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" className="text-foreground/75 hover:text-foreground hover:bg-muted/70" onClick={() => openEdit(category)} data-testid={`button-edit-category-${category.id}`}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="hover:bg-muted/70" data-testid={`button-delete-category-${category.id}`}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete category?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{category.name}". Products in this category will not be deleted automatically.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(category.id)}>
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
