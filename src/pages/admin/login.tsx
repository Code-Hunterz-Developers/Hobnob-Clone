import React from 'react';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminAuth } from '@/lib/admin-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BrandLogo } from '@/components/brand-logo';

export default function AdminLoginPage() {
  const { login, isAuthenticated, isLoading } = useAdminAuth();
  const [, navigate] = useLocation();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/admin');
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      toast.error('Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-theme admin-orchard min-h-[100dvh] flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md border-primary/15 bg-card/95 shadow-2xl backdrop-blur">
        <CardHeader className="items-center text-center">
          <BrandLogo priority="admin" imageClassName="h-24 sm:h-28" />
          <CardTitle className="font-serif text-3xl">Admin Login</CardTitle>
          <CardDescription>Sign in to manage Lavashak Karachi orders, categories, and products.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="input-admin-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="input-admin-password"
              />
            </div>
            <Button type="submit" className="w-full rounded-xl h-11 font-semibold" disabled={submitting} data-testid="button-admin-login">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Log in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
