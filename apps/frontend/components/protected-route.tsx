'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireModerator?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireAdmin = false,
  requireModerator = false,
  redirectTo = '/login',
}) => {
  const { user, loading, isAuthenticated, isAdmin, isModerator } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      if (requireAdmin && !isAdmin) {
        router.push('/map');
        return;
      }

      if (requireModerator && !isModerator) {
        router.push('/map');
        return;
      }
    }
  }, [loading, isAuthenticated, isAdmin, isModerator, requireAuth, requireAdmin, requireModerator, redirectTo, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (requireAdmin && !isAdmin) {
    return null;
  }

  if (requireModerator && !isModerator) {
    return null;
  }

  return <>{children}</>;
}; 