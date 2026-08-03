import { Discrepancy } from '@/types/database';

export interface DiscrepancyFilters {
  type?: string;
  receiver?: string;
}

export function filterDiscrepancies(discrepancies: Discrepancy[], filters: DiscrepancyFilters) {
  const normalizedType = filters.type?.trim().toLowerCase();
  const normalizedReceiver = filters.receiver?.trim().toLowerCase();

  return discrepancies.filter((item) => {
    const matchesType = !normalizedType || item.type.toLowerCase() === normalizedType;
    const matchesReceiver = !normalizedReceiver || item.receiver_name.toLowerCase().includes(normalizedReceiver);

    return matchesType && matchesReceiver;
  });
}
