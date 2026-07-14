import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order, OrderInput, OrderItem, Product } from './types';

const ordersCol = collection(db, 'orders');

export function orderQueryKey(id: string) {
  return ['orders', id] as const;
}

export function adminOrdersQueryKey() {
  return ['admin-orders'] as const;
}

function toOrder(id: string, data: Record<string, unknown>): Order {
  const createdAt = data.createdAt;
  return {
    id,
    customerName: data.customerName as string,
    phone: data.phone as string,
    address: data.address as string,
    city: data.city as string,
    notes: (data.notes as string | null) ?? null,
    items: data.items as OrderItem[],
    total: data.total as number,
    status: data.status as string,
    createdAt: createdAt instanceof Timestamp ? createdAt.toDate().toISOString() : new Date().toISOString(),
  };
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: async ({ data: input }: { data: OrderInput }): Promise<Order> => {
      const lineItems: OrderItem[] = [];
      for (const item of input.items) {
        const snap = await getDoc(doc(db, 'products', item.productId));
        if (!snap.exists()) {
          throw new Error(`Product ${item.productId} not found`);
        }
        const product = { id: snap.id, ...(snap.data() as Omit<Product, 'id'>) };
        const unitPrice = product.discountPrice ?? product.price;
        lineItems.push({
          productId: product.id,
          name: product.name,
          quantity: item.quantity,
          unitPrice,
          imageUrl: product.imageUrl,
        });
      }

      const total = lineItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

      const orderData = {
        customerName: input.customerName,
        phone: input.phone,
        address: input.address,
        city: input.city,
        notes: input.notes ?? null,
        items: lineItems,
        total,
        status: 'placed',
        createdAt: serverTimestamp(),
      };

      const ref = await addDoc(ordersCol, orderData);
      return toOrder(ref.id, { ...orderData, createdAt: Timestamp.now() });
    },
  });
}

export function useGetOrder(id: string | undefined, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: orderQueryKey(id ?? ''),
    queryFn: async () => {
      const snap = await getDoc(doc(db, 'orders', id!));
      if (!snap.exists()) throw new Error('Order not found');
      return toOrder(snap.id, snap.data());
    },
    enabled: !!id && (options.enabled ?? true),
    retry: false,
  });
}

export function useAdminListOrders() {
  return useQuery({
    queryKey: adminOrdersQueryKey(),
    queryFn: async () => {
      const snap = await getDocs(query(ordersCol, orderBy('createdAt', 'desc')));
      return snap.docs.map((d) => toOrder(d.id, d.data()));
    },
  });
}

export function useAdminUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { status: string } }) => {
      await updateDoc(doc(db, 'orders', id), { status: data.status });
      return { id, status: data.status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOrdersQueryKey() });
    },
  });
}
