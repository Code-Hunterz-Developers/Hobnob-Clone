import React from 'react';
import { LogOut, CakeSlice } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAdminAuth } from '@/lib/admin-auth';
import { AdminGuard } from '@/components/admin/admin-guard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminCategoriesTab } from '@/components/admin/categories-tab';
import { AdminProductsTab } from '@/components/admin/products-tab';
import { AdminOrdersTab } from '@/components/admin/orders-tab';

function DashboardContent() {
  const { email, logout } = useAdminAuth();
  const [, navigate] = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-[100dvh] bg-muted/30">
      <header className="bg-background border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
              <CakeSlice className="w-4 h-4" />
            </div>
            <span className="font-serif text-lg font-bold">Sweet Treats Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline" data-testid="text-admin-email">
              {email}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout} data-testid="button-admin-logout">
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-8">
        <Tabs defaultValue="products">
          <TabsList>
            <TabsTrigger value="products" data-testid="tab-products">Products</TabsTrigger>
            <TabsTrigger value="categories" data-testid="tab-categories">Categories</TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">Orders</TabsTrigger>
          </TabsList>
          <TabsContent value="products" className="mt-6">
            <AdminProductsTab />
          </TabsContent>
          <TabsContent value="categories" className="mt-6">
            <AdminCategoriesTab />
          </TabsContent>
          <TabsContent value="orders" className="mt-6">
            <AdminOrdersTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <DashboardContent />
    </AdminGuard>
  );
}
