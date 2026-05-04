import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Edit, Loader2, X, Save } from 'lucide-react'
import { toast } from '../components/Toast'

export default function WheelAdmin() {
  const [prizes, setPrizes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]   = useState(null)
  const [working, setWorking] = useState(false)

  const load = async () => {
    const { data } = await supabase.from('lucky_wheel_prizes').select('*').order('slot_index')
    setPrizes(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    setWorking(true)
    const { error } = await supabase.from('lucky_wheel_prizes').update({
      name: modal.name, amount: modal.amount, probability: modal.probability,
      color: modal.color, is_active: modal.is_active
    }).eq('id', modal.id)
    setWorking(false)
    if (error) { toast.error('เกิดข้อผิดพลาด: ' + error.message); return }
    setModal(null); load()
  }

  const toggle = async (id, val) => {
    await supabase.from('lucky_wheel_prizes').update({ is_active: !val }).eq('id', id)
    load()
  }

  if (loading) return <div className="flex justify-center h-32 items-center"><Loader2 className="animate-spin text-primary" size={24}/></div>

  const totalWeight = prizes.filter(p => p.is_active).reduce((s, p) => s + Number(p.probability), 0)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">วงล้อลุ้นโชค</h1>
        <p className="text-on-surface-variant text-sm">จัดการรางวัลแต่ละช่องของวงล้อ</p>
      </div>

      <div className="glass-panel rounded-2xl shadow-glass p-5">
        <div className="text-sm text-on-surface-variant">น้ำหนักรวม (Active): <span className="font-bold text-secondary">{totalWeight}</span> — แต่ละช่องจะชนะ = probability / total × 100%</div>
      </div>

      <div className="glass-panel rounded-2xl shadow-glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-container text-on-surface-variant text-left">
              <tr>
                <th className="px-4 py-3 font-medium">สี</th>
                <th className="px-4 py-3 font-medium">ชื่อรางวัล</th>
                <th className="px-4 py-3 font-medium">จำนวนเงิน</th>
                <th className="px-4 py-3 font-medium">น้ำหนัก</th>
                <th className="px-4 py-3 font-medium">โอกาสชนะ</th>
                <th className="px-4 py-3 font-medium">สถานะ</th>
                <th className="px-4 py-3 font-medium">แก้ไข</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {prizes.map(p => (
                <tr key={p.id} className={`hover:bg-surface-container-low transition ${!p.is_active ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="w-6 h-6 rounded-full border border-outline-variant" style={{ backgroundColor: p.color || '#ccc' }}></div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-on-surface">{p.name}</td>
                  <td className="px-4 py-3 font-bold text-secondary">
                    {p.amount > 0 ? `฿${Number(p.amount).toLocaleString()}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">{p.probability}</td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    {totalWeight > 0 ? `${((Number(p.probability) / totalWeight) * 100).toFixed(1)}%` : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggle(p.id, p.is_active)}
                      className={`text-xs px-2 py-1 rounded-full font-medium transition ${p.is_active ? 'bg-secondary-container text-on-secondary-container hover:bg-secondary/20' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>
                      {p.is_active ? 'เปิด' : 'ปิด'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setModal({ ...p })} className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition"><Edit size={15}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl shadow-capsule w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-on-surface">แก้ไขรางวัล</h3>
              <button onClick={() => setModal(null)}><X size={20} className="text-outline"/></button>
            </div>
            <div className="space-y-4">
              {[
                { key:'name', label:'ชื่อรางวัล', type:'text' },
                { key:'amount', label:'จำนวนเงิน (บาท, 0 = ไม่ได้เงิน)', type:'number' },
                { key:'probability', label:'น้ำหนัก (ยิ่งมาก ยิ่งออกบ่อย)', type:'number' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-medium text-on-surface-variant mb-1 block">{f.label}</label>
                  <input type={f.type} value={modal[f.key] ?? ''}
                    onChange={e => setModal(m => ({ ...m, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
                    className="w-full bg-surface-container-low border-none rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"/>
                </div>
              ))}
              <div>
                <label className="text-xs font-medium text-on-surface-variant mb-1 block">สีพื้นหลัง</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={modal.color || '#10b981'}
                    onChange={e => setModal(m => ({ ...m, color: e.target.value }))}
                    className="h-10 w-16 rounded-lg border border-outline-variant cursor-pointer p-0.5"/>
                  <span className="text-sm text-on-surface-variant">{modal.color}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={modal.is_active} onChange={e => setModal(m => ({ ...m, is_active: e.target.checked }))} className="w-4 h-4"/>
                <label className="text-sm text-on-surface-variant">เปิดใช้งาน</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={save} disabled={working}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-full font-semibold text-sm transition disabled:opacity-60">
                {working ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} บันทึก
              </button>
              <button onClick={() => setModal(null)} className="px-5 py-2.5 bg-surface-container hover:bg-surface-container-high rounded-full text-sm text-on-surface-variant transition">ยกเลิก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
