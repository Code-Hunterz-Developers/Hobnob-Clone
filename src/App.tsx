import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';

// Layout & Context
import { Layout } from '@/components/layout';
import { CartProvider } from '@/lib/cart';
import { AdminAuthProvider } from '@/lib/admin-auth';

// Pages
import Home from '@/pages/home';
import CategoryPage from '@/pages/category';
import ProductPage from '@/pages/product';
import CartPage from '@/pages/cart';
import CheckoutPage from '@/pages/checkout';
import OrderConfirmationPage from '@/pages/order-confirmation';
import TrackOrderPage from '@/pages/track-order';
import NotFound from '@/pages/not-found';
import AdminLoginPage from '@/pages/admin/login';
import AdminDashboardPage from '@/pages/admin/dashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      retry: (failureCount, error) => {
        // Firestore/Storage permission errors won't succeed on retry — fail fast.
        const code = (error as { code?: string })?.code;
        if (code === 'permission-denied' || code === 'unauthenticated') return false;
        return failureCount < 1;
      },
      retryDelay: 400,
    },
  },
});

function StorefrontRouter() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/category/:slug" component={CategoryPage} />
        <Route path="/product/:id" component={ProductPage} />
        <Route path="/cart" component={CartPage} />
        <Route path="/checkout" component={CheckoutPage} />
        <Route path="/order/:id" component={OrderConfirmationPage} />
        <Route path="/track-order" component={TrackOrderPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin" component={AdminDashboardPage} />
      <Route component={StorefrontRouter} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <CartProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
              <Router />
            </WouterRouter>
            <Toaster />
            <SonnerToaster />
          </TooltipProvider>
        </CartProvider>
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
