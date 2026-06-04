import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import { Edit, ToggleLeft, ToggleRight, Save, X, Search, Loader2 } from 'lucide-react'
import { alert } from '../utils/alert'
import { toast } from '../components/Toast'

const fmt = (n) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })

export default function InstantBetTypes() {
  const [betTypes, setBetTypes] = useState([])
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [editForm, setEditForm] = useState({})

  const loadBetTypes = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('admin_get_instant_bet_types')
    if (error) {
      toast.error('โหลดข้อมูลล้มเหลว: ' + error.message)
    } else {
      setBetTypes(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadBetTypes() }, [loadBetTypes])

  const handleEdit = (t) => {
    setEditing(t.id)
    setEditForm({
      name: t.name,
      rate: t.rate,
      min_digits: t.min_digits,
      max_digits: t.max_digits,
      is_positioned: t.is_positioned,
    })
  }

  const handleCancel = () => { setEditing(null); setEditForm({}) }

  const handleSave = async (id) => {
    const { error } = await supabase.rpc('admin_update_instant_bet_type', {
      p_id: id,
      p_name: editForm.name,
      p_rate: editForm.rate,
      p_min_digits: editForm.min_digits,
      p_max_digits: editForm.max_digits,
      p_is_positioned: editForm.is_positioned,
    })
    if (error) { alert.error('บันทึกไม่สำเร็จ', error.message); return }
    setEditing(null); setEditForm({})
    toast.success('บันทึกอัตราจ่ายเรียบร้อยแล้ว')
    loadBetTypes()
  }

  const handleToggle = async (id) => {
    const { error } = await supabase.rpc('admin_toggle_instant_bet_type', { p_id: id })
    if (error) { alert.error('เปลี่ยนสถานะไม่สำเร็จ', error.message); return }
    loadBetTypes()
  }

  const filteredTypes = betTypes.filter(t =>
    (t.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-emerald-800" size={32} />
      </div>
    )
  }

  return (
    <div className="space-y-6" style={{ fontFamily: 'Prompt, sans-serif' }}>
      <div>
        <h1 className="text-3xl font-bold text-[#022c22]">ตั้งค่าอัตราจ่ายหวย 1 นาที</h1>
        <p className="text-sm text-slate-500 mt-1">แก้ไขอัตราจ่ายและเปิด/ปิดประเภทเดิมพันแต่ละแบบ</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="ค้นหาประเภทเดิมพัน..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-700"
        />
      </div>

      {/* Table */}
      <div className="rounded-3xl p-6 overflow-x-auto" style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.35)', boxShadow: '0 4px 16px -4px rgba(6,78,59,0.07)' }}>
        <table className="w-full min-w-[680px]">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs font-black text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-3">รหัส (code)</th>
              <th className="py-3 px-3">ชื่อ</th>
              <th className="py-3 px-3">อัตราจ่าย</th>
              <th className="py-3 px-3">หลักเลข</th>
              <th className="py-3 px-3">ปักหลัก</th>
              <th className="py-3 px-3">สถานะ</th>
              <th className="py-3 px-3">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredTypes.map((t) => (
              <tr key={t.id} className="border-b border-slate-50 hover:bg-emerald-50/40 transition">
                {editing === t.id ? (
                  <>
                    <td className="py-3 px-3 font-mono text-sm text-slate-500">{t.code}</td>
                    <td className="py-3 px-3">
                      <input type="text" value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700" />
                    </td>
                    <td className="py-3 px-3">
                      <input type="number" step="0.1" value={editForm.rate ?? 0}
                        onChange={(e) => setEditForm({ ...editForm, rate: parseFloat(e.target.value) })}
                        className="w-28 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 font-bold text-emerald-800" />
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <input type="number" value={editForm.min_digits ?? 0}
                          onChange={(e) => setEditForm({ ...editForm, min_digits: parseInt(e.target.value) })}
                          className="w-14 px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center" />
                        <span className="text-slate-300">-</span>
                        <input type="number" value={editForm.max_digits ?? 0}
                          onChange={(e) => setEditForm({ ...editForm, max_digits: parseInt(e.target.value) })}
                          className="w-14 px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center" />
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <input type="checkbox" checked={!!editForm.is_positioned}
                        onChange={(e) => setEditForm({ ...editForm, is_positioned: e.target.checked })}
                        className="w-5 h-5 accent-emerald-700" />
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${t.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'}`}>
                        {t.is_active ? 'เปิด' : 'ปิด'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleSave(t.id)} className="p-2 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition"><Save size={16} /></button>
                        <button onClick={handleCancel} className="p-2 bg-slate-200 text-slate-600 rounded-xl hover:bg-slate-300 transition"><X size={16} /></button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-3 px-3 font-mono text-sm font-bold text-[#022c22]">{t.code}</td>
                    <td className="py-3 px-3 text-sm text-slate-700">{t.name}</td>
                    <td className="py-3 px-3 text-sm font-bold text-emerald-800">{fmt(t.rate)}</td>
                    <td className="py-3 px-3 text-sm text-slate-500">{t.min_digits}-{t.max_digits}</td>
                    <td className="py-3 px-3 text-sm">{t.is_positioned ? '✓' : '—'}</td>
                    <td className="py-3 px-3">
                      <button onClick={() => handleToggle(t.id)}
                        className={`p-1.5 rounded-xl transition ${t.is_active ? 'text-emerald-700 hover:bg-emerald-100' : 'text-red-500 hover:bg-red-100'}`}>
                        {t.is_active ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                      </button>
                    </td>
                    <td className="py-3 px-3">
                      <button onClick={() => handleEdit(t)} className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-emerald-100 hover:text-emerald-800 transition"><Edit size={16} /></button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {filteredTypes.length === 0 && (
              <tr><td colSpan={7} className="py-10 text-center text-slate-400 italic">ไม่พบประเภทเดิมพัน</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
