import { useCallback, useState } from 'react'

import { auth } from '@/services/auth'
import { deleteAuthProfiles, loginAndLoadNodes } from '@/services/node-profile'

export interface UseAuthReturn {
  isLoggedIn: boolean
  userId: number | null
  login: (
    username: string,
    password: string,
  ) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  checkAuth: () => boolean
}

export const useAuth = (): UseAuthReturn => {
  const [userId, setUserId] = useState<number | null>(() => auth.getUserId())
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    () => !!auth.getUserId(),
  )

  const login = useCallback(
    async (
      username: string,
      password: string,
    ): Promise<{ success: boolean; message?: string }> => {
      try {
        const result = await loginAndLoadNodes(username, password)

        if (result.success) {
          const id = auth.getUserId()
          if (id) {
            setUserId(id)
            setIsLoggedIn(true)
          }
          return { success: true }
        }

        return { success: false, message: result.message }
      } catch {
        return { success: false, message: '网络连接失败，请检查网络' }
      }
    },
    [],
  )

  const logout = useCallback(async () => {
    auth.clearAuth()
    setUserId(null)
    setIsLoggedIn(false)
    await deleteAuthProfiles()
  }, [])

  const checkAuth = useCallback((): boolean => {
    const id = auth.getUserId()
    if (id) {
      setUserId(id)
      setIsLoggedIn(true)
      return true
    }
    return false
  }, [])

  return { isLoggedIn, userId, login, logout, checkAuth }
}
