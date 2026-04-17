import { useQuery } from '@tanstack/react-query'
import { fetchItems } from '../lib/api'

export function useItems() {
  return useQuery({
    queryKey: ['items'],
    queryFn: fetchItems,
    staleTime: 1000 * 60 * 5,
  })
}
