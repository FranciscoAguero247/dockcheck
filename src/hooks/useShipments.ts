'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Shipment } from '@/types/database';

export function useShipments() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Initial Fetch
    async function fetchShipments() {
      const { data, error } = await supabase
        .from('shipments')
        .select(`
          *,
          vendor:vendors(name, code)
        `)
        .order('scheduled_arrival', { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setShipments(data || []);
      }
      setLoading(false);
    }

    fetchShipments();

    // 2. Supabase Realtime Subscription
    const channel = supabase
      .channel('public:shipments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shipments' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setShipments((prev) =>
              prev.map((item) =>
                item.id === payload.new.id ? { ...item, ...payload.new } : item
              )
            );
          } else if (payload.eventType === 'INSERT') {
            fetchShipments(); // Refetch to get vendor relation
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { shipments, loading, error };
}