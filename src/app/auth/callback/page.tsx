'use client';
import { useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data.session) {
        router.push('/');
      } else {
        router.push('/login');
      }
    };

    handleAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
