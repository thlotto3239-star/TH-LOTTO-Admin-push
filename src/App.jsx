import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import AdminGuard from './AdminGuard'
import Layout from './components/Layout'
import { Loader2 } from 'lucide-react'

const Login            = lazy(() => import('./pages/Login'))
const Dashboard        = lazy(() => import('./pages/Dashboard'))
const Deposits         = lazy(() => import('./pages/Deposits'))
const Withdrawals      = lazy(() => import('./pages/Withdrawals'))
const Members          = lazy(() => import('./pages/Members'))
const LotteryMarkets   = lazy(() => import('./pages/LotteryMarkets'))
const Results          = lazy(() => import('./pages/Results'))
const BetsList         = lazy(() => import('./pages/BetsList'))
const RestrictedNumbers = lazy(() => import('./pages/RestrictedNumbers'))
const WheelAdmin       = lazy(() => import('./pages/WheelAdmin'))
const Settings         = lazy(() => import('./pages/Settings'))
const Appearance       = lazy(() => import('./pages/Appearance'))
const Sliders          = lazy(() => import('./pages/Sliders'))
const Promotions       = lazy(() => import('./pages/Promotions'))
const Articles         = lazy(() => import('./pages/Articles'))
const Banks            = lazy(() => import('./pages/Banks'))
const Admins           = lazy(() => import('./pages/Admins'))
const TestConnection   = lazy(() => import('./pages/TestConnection'))

const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <Loader2 className="animate-spin text-primary" size={28} />
  </div>
)

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<AdminGuard><Layout /></AdminGuard>}>
              <Route index element={<Dashboard />} />
              <Route path="deposits" element={<Deposits />} />
              <Route path="withdrawals" element={<Withdrawals />} />
              <Route path="members" element={<Members />} />
              <Route path="markets" element={<LotteryMarkets />} />
              <Route path="results" element={<Results />} />
              <Route path="bets" element={<BetsList />} />
              <Route path="restricted" element={<RestrictedNumbers />} />
              <Route path="wheel" element={<WheelAdmin />} />
              <Route path="settings" element={<Settings />} />
              <Route path="appearance" element={<Appearance />} />
              <Route path="sliders" element={<Sliders />} />
              <Route path="promotions" element={<Promotions />} />
              <Route path="articles" element={<Articles />} />
              <Route path="banks" element={<Banks />} />
              <Route path="admins" element={<Admins />} />
            </Route>
            <Route path="/test" element={<AdminGuard><TestConnection /></AdminGuard>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}
