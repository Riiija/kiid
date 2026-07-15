import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded'
import { Box, Card, CardContent, Stack, Typography } from '@mui/material'

type PlaceholderPageProps = {
  title: string
  description: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <Box sx={{ maxWidth: 760 }}>
      <Card variant="outlined" sx={{ borderColor: 'rgba(109, 93, 251, 0.14)' }}>
        <CardContent>
          <Stack spacing={2}>
            <Stack
              aria-hidden="true"
              sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                alignItems: 'center',
                justifyContent: 'center',
                color: 'primary.main',
                backgroundColor: 'rgba(109, 93, 251, 0.1)',
              }}
            >
              <ConstructionRoundedIcon />
            </Stack>
            <Stack spacing={0.75}>
              <Typography variant="h2">{title}</Typography>
              <Typography color="text.secondary">{description}</Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
