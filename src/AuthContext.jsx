import React, { createContext, useContext, useEffect, useState } from 'react'
import * as authService from './services/authService'
import logger from './services/logger'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authService.getSession().then((session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      else setLoading(false)
    })
    const subscription = authService.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (uid) => {
    try {
      const data = await authService.fetchAdminProfile(uid)
      setProfile(data)
    } catch (e) {
      logger.error('Admin profile error:', e.message)
    } finally {
      setLoading(false)
    }
  }

  const isSuperAdmin = () => authService.isSuperAdmin(profile)

  const hasPermission = (perm) => authService.hasPermission(profile, perm)

  const signIn = async (phone, pin) => authService.signIn(phone, pin)

  const signOut = () => authService.signOut()

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut, isSuperAdmin, hasPermission, refreshProfile: () => loadProfile(user?.id) }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
