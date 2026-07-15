import { Box } from '@mui/material'
import { Outlet } from 'react-router-dom'
import { family } from '../../mocks/currentUser'
import { ResponsiveNavigation } from '../navigation/ResponsiveNavigation'
import { childNavigationItems } from '../navigation/navigationItems'

export function ChildLayout() {
  return (
    <Box sx={{ minHeight: '100svh', display: { xs: 'block', md: 'flex' } }}>
      <ResponsiveNavigation items={childNavigationItems} familyLabel={family.name} />
      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          px: { xs: 2, sm: 3, lg: 5 },
          pt: { xs: 2.5, md: 4 },
          pb: { xs: 12, md: 5 },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}
