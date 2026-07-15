import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded'
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded'
import { Avatar, Button, Card, CardContent, Dialog, DialogContent, DialogTitle, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { PageHeader } from '../../../components/common/PageHeader'
import { PageSkeleton } from '../../../components/common/PageSkeleton'
import { useChildren } from '../../children/hooks/useChildren'

export function MyQrCodePage() {
  const childrenQuery = useChildren()
  const child = childrenQuery.data?.[0]
  const [largeOpen, setLargeOpen] = useState(false)

  if (childrenQuery.isLoading || !child) {
    return <PageSkeleton rows={2} />
  }

  const qrValue = `kidbank://child/${child.qrToken}`

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow="QR Code"
        title="Mon QR code"
        description="Montre ce QR code a un parent pour ouvrir rapidement ton compte."
      />
      <Card variant="outlined" sx={{ borderColor: 'rgba(109, 93, 251, 0.12)' }}>
        <CardContent>
          <Stack spacing={3} sx={{ alignItems: 'center', textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: child.avatarColor, width: 70, height: 70, fontWeight: 900 }}>{child.avatarInitials}</Avatar>
            <Stack spacing={0.5}>
              <Typography variant="h2">{child.firstName}</Typography>
              <Typography color="text.secondary">Ce code contient seulement un token aleatoire securise.</Typography>
            </Stack>
            <Stack
              sx={{
                p: 2,
                borderRadius: 4,
                backgroundColor: 'common.white',
                boxShadow: '0 18px 46px rgba(65, 105, 225, 0.16)',
              }}
            >
              <QRCodeSVG value={qrValue} size={220} level="H" />
            </Stack>
            <Button variant="contained" startIcon={<OpenInFullRoundedIcon />} onClick={() => setLargeOpen(true)}>
              Agrandir
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={largeOpen} onClose={() => setLargeOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>QR code de {child.firstName}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ alignItems: 'center', py: 2 }}>
            <QrCode2RoundedIcon color="primary" />
            <QRCodeSVG value={qrValue} size={320} level="H" />
          </Stack>
        </DialogContent>
      </Dialog>
    </Stack>
  )
}
