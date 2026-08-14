'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { UserRole } from '@/types/database';

export function useRole() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUserRole() {
      try {    
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setRole(null);
          setLoading(false);
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle() as { data: { role: UserRole } | null; error: any};

        if (error) {
          console.error('Error fetching role:', error.message);
          setRole('receiver');
        } else {
          setRole(profile?.role || 'receiver');
        }
      } catch (error) {
        console.error('Unexpected error in useRole:', error);
        setRole('receiver');
      } finally {
          setLoading(false);
      }
    }

    getUserRole();
  }, []);

  return { role, isSupervisor: role === 'supervisor' || role === 'admin', loading };
}