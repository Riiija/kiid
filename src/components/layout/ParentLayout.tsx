import { Box } from '@mui/material'
import { Outlet } from 'react-router-dom'
import { family } from '../../mocks/currentUser'
import { ResponsiveNavigation } from '../navigation/ResponsiveNavigation'
import { parentNavigationItems } from '../navigation/navigationItems'

export function ParentLayout() {
  return (
    <Box sx={{ minHeight: '100svh', display: { xs: 'block', md: 'flex' } }}>
      <ResponsiveNavigation items={parentNavigationItems} familyLabel={family.name} />
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
