import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Category, CategoryInput } from './types';

const categoriesCol = collection(db, 'categories');

export function categoriesQueryKey() {
  return ['categories'] as const;
}

async function fetchCategories(): Promise<Category[]> {
  const snap = await getDocs(query(categoriesCol, orderBy('name')));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Category, 'id'>) }));
}

export function useListCategories() {
  return useQuery({
    queryKey: categoriesQueryKey(),
    queryFn: fetchCategories,
    // Categories drive the nav — they rarely change, so cache them longer
    // than the app default to avoid a refetch (and nav flicker) on every visit.
    staleTime: 30 * 60 * 1000,
  });
}

export function useAdminCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data }: { data: CategoryInput }) => {
      const ref = await addDoc(categoriesCol, data);
      return { id: ref.id, ...data } as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesQueryKey() });
    },
  });
}

export function useAdminUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CategoryInput }) => {
      await updateDoc(doc(db, 'categories', id), { ...data });
      return { id, ...data } as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesQueryKey() });
    },
  });
}

export function useAdminDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      await deleteDoc(doc(db, 'categories', id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesQueryKey() });
    },
  });
}
