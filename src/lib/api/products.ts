import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product, ProductInput } from './types';

const productsCol = collection(db, 'products');

export interface ListProductsFilters {
  categorySlug?: string;
  tag?: string;
  search?: string;
}

export function productsQueryKey(filters?: ListProductsFilters) {
  return ['products', filters ?? {}] as const;
}

export function productQueryKey(id: string) {
  return ['products', id] as const;
}

function toProduct(id: string, data: Omit<Product, 'id'>): Product {
  return { id, ...data };
}

async function fetchProducts(filters: ListProductsFilters = {}): Promise<Product[]> {
  const constraints = [];
  if (filters.categorySlug) {
    constraints.push(where('categorySlug', '==', filters.categorySlug));
  }
  if (filters.tag) {
    constraints.push(where('tags', 'array-contains', filters.tag));
  }
  const snap = await getDocs(query(productsCol, ...constraints));
  let products = snap.docs.map((d) => toProduct(d.id, d.data() as Omit<Product, 'id'>));

  if (filters.search) {
    const term = filters.search.toLowerCase();
    products = products.filter((p) => p.name.toLowerCase().includes(term));
  }

  return products;
}

export function useListProducts(filters: ListProductsFilters = {}, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: productsQueryKey(filters),
    queryFn: () => fetchProducts(filters),
    enabled: options.enabled ?? true,
  });
}

export function useGetProduct(id: string | undefined) {
  return useQuery({
    queryKey: productQueryKey(id ?? ''),
    queryFn: async () => {
      const snap = await getDoc(doc(db, 'products', id!));
      if (!snap.exists()) throw new Error('Product not found');
      return toProduct(snap.id, snap.data() as Omit<Product, 'id'>);
    },
    enabled: !!id,
  });
}

async function resolveCategorySlug(categoryId: string): Promise<string> {
  const snap = await getDoc(doc(db, 'categories', categoryId));
  if (!snap.exists()) throw new Error('Category not found');
  return (snap.data() as { slug: string }).slug;
}

export function useAdminCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data }: { data: ProductInput }) => {
      const categorySlug = await resolveCategorySlug(data.categoryId);
      const ref = await addDoc(productsCol, { ...data, categorySlug });
      return toProduct(ref.id, { ...data, categorySlug });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useAdminUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProductInput }) => {
      const categorySlug = await resolveCategorySlug(data.categoryId);
      await updateDoc(doc(db, 'products', id), { ...data, categorySlug });
      return toProduct(id, { ...data, categorySlug });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useAdminDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      await deleteDoc(doc(db, 'products', id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
