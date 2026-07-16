import React from 'react';
import { LogOut } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAdminAuth } from '@/lib/admin-auth';
import { AdminGuard } from '@/components/admin/admin-guard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminCategoriesTab } from '@/components/admin/categories-tab';
import { AdminProductsTab } from '@/components/admin/products-tab';
import { AdminOrdersTab } from '@/components/admin/orders-tab';
import { BrandLogo } from '@/components/brand-logo';

function DashboardContent() {
  const { email, logout } = useAdminAuth();
  const [, navigate] = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-theme admin-orchard min-h-[100dvh]">
      <header className="bg-background/85 border-b border-border sticky top-0 z-10 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-6 min-h-24 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo priority="admin" imageClassName="h-16 md:h-20" />
            <div>
              <p className="font-serif text-xl md:text-2xl font-bold leading-none">Admin Panel</p>
              <p className="text-sm text-muted-foreground mt-1">Products, categories, orders</p>
            </div>
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
          <TabsList className="bg-card/80 border border-border h-auto p-1.5 rounded-2xl">
            <TabsTrigger value="products" className="rounded-xl px-4 py-2.5" data-testid="tab-products">Products</TabsTrigger>
            <TabsTrigger value="categories" className="rounded-xl px-4 py-2.5" data-testid="tab-categories">Categories</TabsTrigger>
            <TabsTrigger value="orders" className="rounded-xl px-4 py-2.5" data-testid="tab-orders">Orders</TabsTrigger>
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
