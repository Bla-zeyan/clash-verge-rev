import { Box, Container, Typography } from '@mui/material'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'

import LoginForm from '@/components/login/LoginForm'

const LoginPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleLoginSuccess = () => {
    navigate('/', { replace: true })
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: 4,
      }}
    >
      <Container maxWidth="xs">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            gutterBottom
          >
            Clash Verge Rev
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('login.page.subtitle')}
          </Typography>
        </Box>
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </Container>
    </Box>
  )
}

export default LoginPage
