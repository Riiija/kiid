import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded'
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded'
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded'
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'
import type { NavigationItem } from './ResponsiveNavigation'

export const parentNavigationItems: NavigationItem[] = [
  { label: 'Accueil', path: '/parent/dashboard', icon: <HomeRoundedIcon /> },
  { label: 'Transactions', path: '/parent/transactions', icon: <ReceiptLongRoundedIcon /> },
  { label: 'Scanner', path: '/parent/scan', icon: <QrCodeScannerRoundedIcon /> },
  { label: 'Recompenses', path: '/parent/rewards', icon: <EmojiEventsRoundedIcon /> },
  { label: 'Parametres', path: '/parent/settings', icon: <SettingsRoundedIcon /> },
]

export const childNavigationItems: NavigationItem[] = [
  { label: 'Accueil', path: '/child/dashboard', icon: <HomeRoundedIcon /> },
  { label: 'Transactions', path: '/child/transactions', icon: <ReceiptLongRoundedIcon /> },
  { label: 'QR Code', path: '/child/qr-code', icon: <QrCode2RoundedIcon /> },
  { label: 'Recompenses', path: '/child/rewards', icon: <EmojiEventsRoundedIcon /> },
  { label: 'Objectifs', path: '/child/savings', icon: <SavingsRoundedIcon /> },
]
