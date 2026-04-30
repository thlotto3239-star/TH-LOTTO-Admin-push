import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function AdminGuard({ children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-emerald-400 text-lg animate-pulse">กำลังโหลด...</div>
    </div>
  )
  if (!user || !profile?.is_admin) return <Navigate to="/login" replace />
  return children
}
