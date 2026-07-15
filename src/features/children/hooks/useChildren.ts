import { useQuery } from '@tanstack/react-query'
import { getChild, listChildren } from '../services/childrenService'

export const childrenQueryKey = ['children'] as const

export function useChildren() {
  return useQuery({
    queryKey: childrenQueryKey,
    queryFn: listChildren,
  })
}

export function useChild(childId: string | undefined) {
  return useQuery({
    queryKey: ['children', childId],
    queryFn: () => getChild(childId ?? ''),
    enabled: Boolean(childId),
  })
}
