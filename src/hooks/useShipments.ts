'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ShipmentWithVendor } from '@/types/database';

interface ShipmentFilters {
  status?: string;
  date?: string;
}

export function useShipments(filters: ShipmentFilters = {}) {
  const [shipments, setShipments] = useState<ShipmentWithVendor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchShipments() {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('shipments')
        .select(`
          *,
          vendor:vendors(name, code)
        `)
        .order('scheduled_arrival', { ascending: true });

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.date) {
        const selectedDate = new Date(filters.date);
        const start = new Date(selectedDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(selectedDate);
        end.setHours(23, 59, 59, 999);

        query = query.gte('scheduled_arrival', start.toISOString()).lte('scheduled_arrival', end.toISOString());
      }

      const { data, error } = await query;

      if (!isMounted) {
        return;
      }

      if (error) {
        setError(error.message);
        setShipments([]);
      } else {
        setShipments((data as ShipmentWithVendor[]) || []);
      }

      setLoading(false);
    }

    void fetchShipments();

    const channel = supabase
      .channel('public:shipments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shipments' },
        () => {
          if (isMounted) {
            void fetchShipments();
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [filters.date, filters.status]);

  return { shipments, loading, error };
}