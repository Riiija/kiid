import { Card, CardContent, Skeleton, Stack } from '@mui/material'

type PageSkeletonProps = {
  rows?: number
}

export function PageSkeleton({ rows = 3 }: PageSkeletonProps) {
  return (
    <Stack spacing={2}>
      {Array.from({ length: rows }, (_item, index) => (
        <Card key={`skeleton-${index}`} variant="outlined" sx={{ borderColor: 'rgba(109, 93, 251, 0.1)' }}>
          <CardContent>
            <Stack spacing={1.5}>
              <Skeleton variant="rounded" width="42%" height={22} />
              <Skeleton variant="rounded" width="100%" height={16} />
              <Skeleton variant="rounded" width="72%" height={16} />
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  )
}
