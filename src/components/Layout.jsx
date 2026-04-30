import React, { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { supabase } from '../supabaseClient'

const NAV = [
  { to: '/',           label: 'แผงควบคุม',       icon: 'dashboard',              end: true },
  { to: '/deposits',   label: 'รายการฝากเงิน',    icon: 'payments' },
  { to: '/withdrawals',label: 'รายการถอนเงิน',    icon: 'account_balance_wallet' },
  { to: '/members',    label: 'จัดการสมาชิก',     icon: 'group' },
  { to: '/markets',    label: 'ตลาดหวย',          icon: 'confirmation_number' },
  { to: '/bets',       label: 'รายการโพย',        icon: 'list_alt' },
  { to: '/restricted', label: 'เลขอั้น',           icon: 'block' },
  { to: '/wheel',      label: 'จัดการวงล้อ',      icon: 'casino' },
  { to: '/settings',   label: 'ตั้งค่า',           icon: 'settings' },
  { to: '/appearance', label: 'รูปลักษณ์',         icon: 'palette' },
  { to: '/sliders',    label: 'สไลเดอร์',          icon: 'view_carousel' },
  { to: '/promotions', label: 'โปรโมชั่น',         icon: 'campaign' },
  { to: '/articles',   label: 'บทความ',            icon: 'article' },
  { to: '/banks',      label: 'ธนาคาร',            icon: 'account_balance' },
  { to: '/admins',     label: 'ผู้ดูแลระบบ',       icon: 'admin_panel_settings' },
]

export default function Layout() {
  const { profile, signOut } = useAuth()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const [siteSettings, setSiteSettings] = useState({ site_logo_url: '', site_name: 'THLotto' })

  useEffect(() => {
    supabase.from('settings')
      .select('key,value')
      .in('key', ['site_logo_url', 'site_name'])
      .then(({ data }) => {
        if (data) {
          const map = {}
          data.forEach(s => { map[s.key] = s.value })
          setSiteSettings(prev => ({ ...prev, ...map }))
        }
      })
  }, [])

  const handleLogout = async () => { await signOut(); nav('/login', { replace: true }) }
  const initial = (profile?.full_name || 'A')[0].toUpperCase()

  return (
    <div className="min-h-screen bg-background flex font-prompt">
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar — glassmorphic floating pill */}
      <aside className={`
        fixed left-0 top-0 z-40 h-screen w-72 flex flex-col
        bg-white/60 backdrop-blur-xl border border-white/20
        shadow-[0_20px_50px_rgba(6,78,59,0.15)]
        rounded-none lg:rounded-[40px] lg:m-4 lg:h-[calc(100vh-32px)]
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo / Profile */}
        <div className="p-6 flex flex-col items-center border-b border-white/20 flex-shrink-0">
          {siteSettings.site_logo_url ? (
            <img
              src={siteSettings.site_logo_url}
              alt={siteSettings.site_name}
              className="h-16 w-auto object-contain mb-3 drop-shadow-md"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-primary-container flex items-center justify-center mb-3 border-2 border-white shadow-capsule-md">
              <span className="text-on-primary-container text-2xl font-black">{initial}</span>
            </div>
          )}
          <div className="text-lg font-black tracking-tight text-primary">{siteSettings.site_name || 'THLotto'}</div>
          <div className="text-on-surface-variant text-sm mt-1">{profile?.full_name || 'ผู้ดูแลระบบ'}</div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5 scrollbar-thin">
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-4 mx-2 py-3 px-4 rounded-full text-sm font-medium transition-all duration-200 ease-out
                ${isActive
                  ? 'bg-primary text-on-primary shadow-capsule-md'
                  : 'text-on-surface-variant hover:bg-primary/5 hover:text-primary hover:scale-[1.02] active:scale-95'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className="material-symbols-outlined text-[22px] leading-none"
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/20 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 py-3 px-4 rounded-full text-sm font-medium text-on-surface-variant hover:bg-error/10 hover:text-error transition-all duration-200 active:scale-95"
          >
            <span className="material-symbols-outlined text-[22px] leading-none">logout</span>
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-[304px]">
        {/* Header — glassmorphic floating pill */}
        <header className="sticky top-0 z-20 mx-4 mt-4">
          <div className="bg-white/60 backdrop-blur-md rounded-full border border-white/30 shadow-glass px-6 py-0 flex items-center h-16 gap-4">
            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 rounded-full text-on-surface-variant hover:bg-primary/5 active:scale-95 transition-all"
              onClick={() => setOpen(true)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>

            {/* Search */}
            <div className="flex-1 max-w-sm hidden md:flex items-center gap-2 bg-surface-container-low rounded-full px-4 py-2 border border-outline-variant/30">
              <span className="material-symbols-outlined text-outline text-[18px]">search</span>
              <span className="text-sm text-outline">ค้นหา...</span>
            </div>

            <div className="ml-auto flex items-center gap-2">
              {/* Online indicator */}
              <div className="hidden sm:flex items-center gap-2 bg-secondary-container/40 text-on-secondary-container px-3 py-1.5 rounded-full text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse inline-block"></span>
                ระบบออนไลน์
              </div>
              {/* Notification */}
              <button className="p-2 rounded-full text-on-surface-variant hover:bg-primary/5 transition-all">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              {/* Avatar */}
              <div className="h-9 w-9 rounded-full bg-primary-container flex items-center justify-center border-2 border-white shadow-sm text-on-primary-container font-bold text-sm">
                {initial}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pt-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
