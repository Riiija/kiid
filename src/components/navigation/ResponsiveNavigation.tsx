import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import type { ReactElement } from 'react'
import { matchPath, useLocation, useNavigate } from 'react-router-dom'
import { KidBankLogo } from '../common/KidBankLogo'

export type NavigationItem = {
  label: string
  path: string
  icon: ReactElement
}

type ResponsiveNavigationProps = {
  items: NavigationItem[]
  familyLabel: string
}

export function ResponsiveNavigation({ items, familyLabel }: ResponsiveNavigationProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const activePath = items.find((item) => matchPath(`${item.path}/*`, location.pathname))?.path ?? items[0].path

  if (isDesktop) {
    return (
      <Paper
        component="aside"
        elevation={0}
        sx={{
          position: 'sticky',
          top: 0,
          height: '100svh',
          width: 264,
          flex: '0 0 264px',
          borderRight: '1px solid rgba(31, 41, 55, 0.08)',
          borderRadius: 0,
          px: 2,
          py: 3,
          backgroundColor: 'background.paper',
        }}
      >
        <Stack spacing={4} sx={{ height: '100%' }}>
          <Stack spacing={1}>
            <KidBankLogo compact />
            <Typography variant="body2" color="text.secondary">
              {familyLabel}
            </Typography>
          </Stack>
          <Stack component="nav" spacing={0.75} aria-label="Navigation principale">
            {items.map((item) => {
              const active = activePath === item.path

              return (
                <Box
                  key={item.path}
                  component="button"
                  type="button"
                  onClick={() => navigate(item.path)}
                  sx={{
                    border: 0,
                    width: '100%',
                    minHeight: 48,
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 1.5,
                    color: active ? 'primary.main' : 'text.secondary',
                    backgroundColor: active ? 'rgba(109, 93, 251, 0.1)' : 'transparent',
                    cursor: 'pointer',
                    font: 'inherit',
                    fontWeight: active ? 800 : 650,
                    textAlign: 'left',
                    '&:hover': {
                      backgroundColor: active ? 'rgba(109, 93, 251, 0.12)' : 'rgba(31, 41, 55, 0.05)',
                    },
                    '&:focus-visible': {
                      outline: '3px solid rgba(109, 93, 251, 0.32)',
                      outlineOffset: 2,
                    },
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Box>
              )
            })}
          </Stack>
        </Stack>
      </Paper>
    )
  }

  return (
    <Paper
      component="nav"
      elevation={8}
      aria-label="Navigation principale"
      sx={{
        position: 'fixed',
        left: 12,
        right: 12,
        bottom: 12,
        zIndex: theme.zIndex.appBar,
        borderRadius: 4,
        overflow: 'hidden',
        border: '1px solid rgba(109, 93, 251, 0.12)',
      }}
    >
      <BottomNavigation
        showLabels
        value={activePath}
        onChange={(_event, path: string) => navigate(path)}
        sx={{
          minHeight: 72,
          '& .MuiBottomNavigationAction-root': {
            minWidth: 0,
            px: 0.5,
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.7rem',
            fontWeight: 750,
          },
        }}
      >
        {items.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            value={item.path}
            icon={<Tooltip title={item.label}>{item.icon}</Tooltip>}
          />
        ))}
      </BottomNavigation>
    </Paper>
  )
}
