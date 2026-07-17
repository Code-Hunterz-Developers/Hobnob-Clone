import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
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
import CategoriesPage from '@/pages/categories';
import DealBoxesPage from '@/pages/deal-boxes';
import ProductPage from '@/pages/product';
import CartPage from '@/pages/cart';
import CheckoutPage from '@/pages/checkout';
import OrderConfirmationPage from '@/pages/order-confirmation';
import TrackOrderPage from '@/pages/track-order';
import PrivacyPolicyPage from '@/pages/privacy-policy';
import TermsAndConditionsPage from '@/pages/terms-and-conditions';
import FeedbackPage from '@/pages/feedback';
import NotFound from '@/pages/not-found';
import AdminLoginPage from '@/pages/admin/login';
import AdminDashboardPage from '@/pages/admin/dashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      // Keep cached data around long enough for the localStorage persister
      // (below) to actually be useful across page reloads/visits.
      gcTime: 24 * 60 * 60 * 1000,
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

// Persist the query cache to localStorage so data already fetched once
// (categories/nav, products, etc.) renders instantly on the next visit or
// reload instead of showing a loading state while Firestore round-trips.
const persister = createAsyncStoragePersister({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  key: 'sweet-treats-query-cache',
  throttleTime: 1000,
});

function StorefrontRouter() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/categories" component={CategoriesPage} />
        <Route path="/deal-boxes" component={DealBoxesPage} />
        <Route path="/category/:slug" component={CategoryPage} />
        <Route path="/product/:id" component={ProductPage} />
        <Route path="/cart" component={CartPage} />
        <Route path="/checkout" component={CheckoutPage} />
        <Route path="/order/:id" component={OrderConfirmationPage} />
        <Route path="/track-order" component={TrackOrderPage} />
        <Route path="/privacy-policy" component={PrivacyPolicyPage} />
        <Route path="/terms-and-conditions" component={TermsAndConditionsPage} />
        <Route path="/feedback" component={FeedbackPage} />
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
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
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
    </PersistQueryClientProvider>
  );
}

export default App;
