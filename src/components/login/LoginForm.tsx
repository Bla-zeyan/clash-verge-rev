import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Link,
  TextField,
  Typography,
} from '@mui/material'
import { useLockFn } from 'ahooks'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useAuth } from '@/hooks/use-auth'

interface LoginFormProps {
  onLoginSuccess?: () => void
}

export const LoginForm = ({ onLoginSuccess }: LoginFormProps) => {
  const { t } = useTranslation()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = useLockFn(async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!username.trim()) {
      setError('login.page.error.usernameRequired')
      return
    }
    if (!password.trim()) {
      setError('login.page.error.passwordRequired')
      return
    }

    setLoading(true)
    const result = await login(username, password)
    setLoading(false)

    if (result.success) {
      onLoginSuccess?.()
    } else {
      setError(result.message || 'login.page.error.loginFailed')
    }
  })

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {t(error)}
        </Alert>
      )}

      <TextField
        label={t('login.page.field.username')}
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        fullWidth
        autoComplete="username"
        disabled={loading}
      />

      <TextField
        label={t('login.page.field.password')}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        autoComplete="current-password"
        disabled={loading}
      />

      <Button
        type="submit"
        variant="contained"
        size="large"
        fullWidth
        disabled={loading}
        startIcon={
          loading ? <CircularProgress size={20} color="inherit" /> : null
        }
      >
        {loading
          ? t('login.page.button.loggingIn')
          : t('login.page.button.login')}
      </Button>

      <Typography variant="body2" color="text.secondary" align="center">
        {t('login.page.noAccount')}{' '}
        <Link href="#" underline="hover">
          {t('login.page.register')}
        </Link>
      </Typography>
    </Box>
  )
}

export default LoginForm
