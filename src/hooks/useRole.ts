'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { UserRole } from '@/types/database';

export function useRole() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUserRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single<{ role: UserRole }>();

      setRole(profile?.role || 'receiver');
      setLoading(false);
    }

    getUserRole();
  }, []);

  return { role, isSupervisor: role === 'supervisor' || role === 'admin', loading };
}