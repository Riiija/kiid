import { createTheme } from '@mui/material/styles'

export const kidBankTheme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'light',
    primary: {
      main: '#6D5DFB',
      light: '#8D84FF',
      dark: '#4A3FD7',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#4169E1',
      light: '#6A8BFF',
      dark: '#2847A5',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#22C55E',
    },
    warning: {
      main: '#F59E0B',
    },
    error: {
      main: '#EF4444',
    },
    background: {
      default: '#F6F7FB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1F2937',
      secondary: '#667085',
    },
  },
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '2rem',
      lineHeight: 1.12,
      letterSpacing: 0,
    },
    h2: {
      fontWeight: 800,
      fontSize: '1.5rem',
      lineHeight: 1.18,
      letterSpacing: 0,
    },
    h3: {
      fontWeight: 750,
      fontSize: '1.2rem',
      lineHeight: 1.2,
      letterSpacing: 0,
    },
    button: {
      fontWeight: 700,
      textTransform: 'none',
      letterSpacing: 0,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 44,
          borderRadius: 14,
          boxShadow: 'none',
          whiteSpace: 'nowrap',
        },
        contained: {
          boxShadow: '0 12px 26px rgba(109, 93, 251, 0.24)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          boxShadow: '0 14px 40px rgba(31, 41, 55, 0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 700,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
  },
})
