import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Loader2, Users, Search, Target, DollarSign } from 'lucide-react'
import { alert } from '../utils/alert'

const fmt = (n) => Number(n || 0).toLocaleString('th-TH')

export default function Affiliates() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    // For now, load all users with their referral income if available, or just users
    // Since we don't have a direct RPC for admin affiliate list yet, we'll fetch profiles
    supabase.from('profiles').select('id, full_name, member_id, phone, referral_code, commission_balance, created_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setUsers(data || [])
        setLoading(false)
      })
  }, [])

  const filtered = users.filter(u => 
    !search || 
    u.full_name?.includes(search) || 
    u.member_id?.includes(search) ||
    u.phone?.includes(search)
  )

  if (loading) return <div className="flex justify-center h-64 items-center"><Loader2 className="animate-spin text-primary" size={32}/></div>

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">ระบบแนะนำเพื่อน (Affiliate)</h1>
        <p className="text-sm text-on-surface-variant mt-1">จัดการและตรวจสอบรายได้จากการแนะนำเพื่อนของสมาชิก</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={22}/></div>
          <div>
            <p className="text-xs text-on-surface-variant uppercase font-medium">สมาชิกทั้งหมด</p>
            <h3 className="text-xl font-bold text-on-surface">{fmt(users.length)}</h3>
          </div>
        </div>
        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Target size={22}/></div>
          <div>
            <p className="text-xs text-on-surface-variant uppercase font-medium">คอมมิชชั่นสะสม</p>
            <h3 className="text-xl font-bold text-on-surface">฿{fmt(users.reduce((acc, u) => acc + (u.commission_balance || 0), 0))}</h3>
          </div>
        </div>
      </div>

      <div className="glass-panel p-4 rounded-2xl flex items-center gap-2">
        <Search size={18} className="text-outline"/>
        <input 
          value={search} 
          onChange={e => setSearch(e.target.value)}
          placeholder="ค้นหาชื่อ, รหัสสมาชิก หรือเบอร์โทร..."
          className="flex-1 bg-transparent border-none focus:outline-none text-sm text-on-surface"
        />
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-container text-left text-on-surface-variant uppercase text-xs">
            <tr>
              <th className="px-5 py-4 font-semibold">สมาชิก</th>
              <th className="px-5 py-4 font-semibold">รหัสแนะนำ</th>
              <th className="px-5 py-4 font-semibold text-right">คอมมิชชั่นสะสม</th>
              <th className="px-5 py-4 font-semibold">วันที่สมัคร</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {filtered.map(u => (
              <tr key={u.id} className="hover:bg-surface-container-low transition">
                <td className="px-5 py-3">
                  <p className="font-medium text-on-surface">{u.full_name || 'ไม่ระบุชื่อ'}</p>
                  <p className="text-[11px] text-outline">{u.member_id} · {u.phone}</p>
                </td>
                <td className="px-5 py-3 text-secondary font-medium">{u.referral_code || '-'}</td>
                <td className="px-5 py-3 text-right font-bold text-emerald-600">
                  ฿{fmt(u.commission_balance)}
                </td>
                <td className="px-5 py-3 text-on-surface-variant text-xs">
                  {new Date(u.created_at).toLocaleDateString('th-TH')}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-10 text-outline">ไม่พบข้อมูลสมาชิก</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
