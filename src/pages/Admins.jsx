import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Shield, ShieldOff, Loader2 } from 'lucide-react'
import { useAuth } from '../AuthContext'

export default function Admins() {
  const { profile: me } = useAuth()
  const [rows, setRows]     = useState([])
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(null)

  const load = async () => {
    const { data } = await supabase.from('profiles')
      .select('id,member_id,full_name,phone,is_admin,status,created_at')
      .eq('is_admin', true)
      .order('created_at')
    setRows(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const toggleAdmin = async (id, val) => {
    if (id === me?.id) { alert('ไม่สามารถลบสิทธิ์ตัวเองได้'); return }
    setWorking(id)
    await supabase.rpc('admin_update_member', { p_user_id: id, p_patch: { is_admin: !val } })
    setWorking(null)
    load()
  }

  if (loading) return <div className="flex justify-center h-32 items-center"><Loader2 className="animate-spin text-emerald-500" size={24}/></div>

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">จัดการ Admin</h1>
        <p className="text-on-surface-variant text-sm">รายชื่อ Admin ทั้งหมด</p>
      </div>

      <div className="glass-panel rounded-2xl p-4 text-sm border-l-4 border-primary">
        <span className="font-semibold text-primary">เพิ่ม Admin ใหม่:</span> <span className="text-on-surface-variant">ไปที่หน้า "สมาชิก" ค้นหาผู้ใช้ แล้วกดปุ่ม "แก้ไข" เปิด is_admin = true</span>
      </div>

      <div className="glass-panel rounded-2xl shadow-glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-container text-on-surface-variant text-left">
              <tr>
                <th className="px-4 py-3 font-medium">สมาชิก</th>
                <th className="px-4 py-3 font-medium">เบอร์</th>
                <th className="px-4 py-3 font-medium">Member ID</th>
                <th className="px-4 py-3 font-medium">สมัครเมื่อ</th>
                <th className="px-4 py-3 font-medium">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {rows.map(r => (
                <tr key={r.id} className="hover:bg-surface-container-low transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                        {(r.full_name || 'A')[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-on-surface">{r.full_name || '-'}</div>
                        <div className="text-xs text-outline">{r.member_id} · {r.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">{r.phone}</td>
                  <td className="px-4 py-3 text-on-surface-variant font-mono text-xs">{r.member_id}</td>
                  <td className="px-4 py-3 text-xs text-outline">{new Date(r.created_at).toLocaleDateString('th-TH')}</td>
                  <td className="px-4 py-3">
                    {r.id !== me?.id && (
                      <button onClick={() => toggleAdmin(r.id, r.is_admin)} disabled={working === r.id}
                        className="text-xs px-3 py-1.5 bg-error-container hover:bg-error/10 text-on-error-container rounded-full font-medium transition disabled:opacity-60">
                        {working === r.id ? <Loader2 size={13} className="animate-spin"/> : <ShieldOff size={13}/>}
                        ถอนสิทธิ์
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2"><Shield size={16}/> เพิ่ม Admin</h3>
        <p className="text-sm text-slate-500">ไปที่ <strong>สมาชิกทั้งหมด</strong> → ค้นหาสมาชิก → กด "แก้ไข" → เปิด is_admin = true</p>
      </div>
    </div>
  )
}
