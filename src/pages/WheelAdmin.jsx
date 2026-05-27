import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Loader2, Save, Plus } from 'lucide-react'
import { toast } from '../components/Toast'

export default function WheelAdmin() {
  const [prizes, setPrizes] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const { data } = await supabase.from('lucky_wheel_prizes').select('*').order('slot_index')
    setPrizes(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const updatePrize = async (id, updates) => {
    await supabase.from('lucky_wheel_prizes').update(updates).eq('id', id)
    load()
  }

  const saveAll = async () => {
    setSaving(true)
    await Promise.all(prizes.map(p => 
      supabase.from('lucky_wheel_prizes').update({
        name: p.name, amount: p.amount, probability: p.probability,
        color: p.color, is_active: p.is_active
      }).eq('id', p.id)
    ))
    setSaving(false)
    toast.success('บันทึกการเปลี่ยนแปลงเรียบร้อย')
  }

  const toggle = async (id, current) => {
    await supabase.from('lucky_wheel_prizes').update({ is_active: !current }).eq('id', id)
    load()
  }

  if (loading) return <div className="flex justify-center h-32 items-center"><Loader2 className="animate-spin text-primary" size={24}/></div>

  const activePrizes = prizes.filter(p => p.is_active)
  const totalWeight = activePrizes.reduce((s, p) => s + Number(p.probability), 0)
  const totalSlots = activePrizes.length

  // Generate conic-gradient from actual prize colors
  const wheelGradient = React.useMemo(() => {
    if (activePrizes.length === 0) return 'conic-gradient(#e2e8f0 0deg 360deg)'
    let currentDeg = 0
    const stops = []
    for (const p of activePrizes) {
      const sliceDeg = totalWeight > 0 ? (Number(p.probability) / totalWeight) * 360 : 360 / activePrizes.length
      stops.push(`${p.color || '#ccc'} ${currentDeg.toFixed(2)}deg ${(currentDeg + sliceDeg).toFixed(2)}deg`)
      currentDeg += sliceDeg
    }
    return `conic-gradient(${stops.join(', ')})`
  }, [activePrizes, totalWeight])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-h2 text-h2 text-on-surface">จัดการวงล้อลุ้นโชค</h2>
          <p className="font-body-md text-body-md text-outline mt-1">จัดการช่อง น้ำหนัก และรูปลักษณ์</p>
        </div>
        <button onClick={saveAll} disabled={saving}
          className="bg-primary text-on-primary font-button text-button px-6 py-3 rounded-full hover:scale-[1.02] transition-transform flex items-center gap-2 shadow-[0_10px_30px_rgba(0,53,39,0.2)]">
          <span className="material-symbols-outlined text-[20px]"><Save size={20}/></span>
          บันทึกการเปลี่ยนแปลง
        </button>
      </div>

      {/* Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Wheel Preview / Composition */}
        <div className="lg:col-span-5 flex flex-col gap-gutter">
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_20px_50px_rgba(6,78,59,0.05)] border border-white relative overflow-hidden flex-1">
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent pointer-events-none"></div>
            <h3 className="font-h3 text-h3 text-on-surface mb-6 relative z-10">องค์ประกอบวงล้อ</h3>
            <div className="relative w-full aspect-square max-w-[320px] mx-auto flex items-center justify-center mt-4">
              {/* Wheel */}
              <div className="w-full h-full rounded-full border-[12px] border-surface-variant relative shadow-inner flex items-center justify-center overflow-hidden">
                {/* Actual Prize Slices */}
                <div className="absolute w-full h-full" style={{ background: wheelGradient }}></div>
                {/* Slice dividers */}
                <div className="absolute w-full h-full" style={{
                  background: `repeating-conic-gradient(transparent 0deg 0.5deg, rgba(255,255,255,0.4) 0.5deg 1deg)`
                }}></div>
                {/* Center Pin */}
                <div className="w-16 h-16 bg-surface-container-lowest rounded-full shadow-[0_5px_15px_rgba(0,0,0,0.2)] z-10 flex items-center justify-center border-4 border-surface-variant">
                  <div className="w-4 h-4 bg-primary rounded-full"></div>
                </div>
                {/* Pointer */}
                <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-primary drop-shadow-md z-20"></div>
              </div>
            </div>
            <div className="mt-8 space-y-4 relative z-10">
              <div className="flex justify-between items-center p-4 bg-surface-container rounded-lg border border-white/50 shadow-sm">
                <span className="font-label-sm text-label-sm text-on-surface-variant">จำนวนช่องทั้งหมด</span>
                <span className="font-h3 text-h3 text-primary">{totalSlots}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-surface-container rounded-lg border border-white/50 shadow-sm">
                <span className="font-label-sm text-label-sm text-on-surface-variant">ฐานน้ำหนักรวม</span>
                <span className="font-h3 text-h3 text-primary">{totalWeight.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Slots List */}
        <div className="lg:col-span-7">
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_20px_50px_rgba(6,78,59,0.05)] border border-white h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-h3 text-h3 text-on-surface">จัดการช่อง</h3>
              <button onClick={async () => {
                const { data, error } = await supabase.from('lucky_wheel_prizes').insert({
                  name: 'รางวัลใหม่', amount: 0, probability: 1,
                  color: '#10b981', is_active: true, slot_index: prizes.length
                }).select().single()
                if (!error && data) { setPrizes([...prizes, data]); toast.success('เพิ่มช่องแล้ว') }
                else { toast.error('เพิ่มช่องไม่สำเร็จ') }
              }} className="bg-surface-variant text-on-surface hover:bg-surface-dim font-button text-button px-4 py-2 rounded-full transition-colors flex items-center gap-2 text-sm">
                <span className="material-symbols-outlined text-[18px]"><Plus size={18}/></span>
                เพิ่มช่อง
              </button>
            </div>
            <div className="space-y-3">
              {prizes.map(p => {
                const winPct = totalWeight > 0 ? ((Number(p.probability) / totalWeight) * 100).toFixed(2) : '0.00'
                return (
                  <div key={p.id} className="bg-surface p-4 rounded-lg border border-surface-variant hover:border-primary-fixed-dim transition-colors group relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-2" style={{ backgroundColor: p.color || '#ccc' }}></div>
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center ml-2">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        <div>
                          <label className="block font-label-sm text-label-sm text-outline mb-1">ชื่อรางวัล</label>
                          <input className="w-full bg-surface-bright border-none rounded-full px-4 py-2 text-on-surface font-body-md focus:ring-2 focus:ring-primary/20 shadow-inner" 
                            type="text" value={p.name || ''}
                            onChange={e => {
                              const updated = prizes.map(pr => pr.id === p.id ? { ...pr, name: e.target.value } : pr)
                              setPrizes(updated)
                            }}/>
                        </div>
                        <div>
                          <label className="block font-label-sm text-label-sm text-outline mb-1">จำนวน / มูลค่า</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline font-body-md">฿</span>
                            <input className="w-full bg-surface-bright border-none rounded-full pl-7 pr-4 py-2 text-on-surface font-body-md focus:ring-2 focus:ring-primary/20 shadow-inner" 
                              type="number" value={p.amount || 0}
                              onChange={e => {
                                const updated = prizes.map(pr => pr.id === p.id ? { ...pr, amount: Number(e.target.value) } : pr)
                                setPrizes(updated)
                              }}/>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 w-full sm:w-auto shrink-0 justify-between sm:justify-start">
                        <div className="text-right">
                          <label className="block font-label-sm text-label-sm text-outline mb-1">น้ำหนัก</label>
                          <input className="w-20 bg-surface-bright border-none rounded-full px-3 py-2 text-on-surface font-body-md text-center focus:ring-2 focus:ring-primary/20 shadow-inner" 
                            type="number" value={p.probability || 0}
                            onChange={e => {
                              const updated = prizes.map(pr => pr.id === p.id ? { ...pr, probability: Number(e.target.value) } : pr)
                              setPrizes(updated)
                            }}/>
                        </div>
                        <div className="text-right flex flex-col items-end justify-center pt-5">
                          <span className="font-body-md text-body-md text-primary font-bold">{winPct}%</span>
                          <span className="text-[10px] text-outline uppercase tracking-wider">โอกาสชนะ</span>
                        </div>
                        <div className="pt-5 flex items-center gap-2">
                          <input className="w-8 h-8 rounded-full border-0 p-0 cursor-pointer shadow-sm" 
                            type="color" value={p.color || '#10b981'}
                            onChange={e => {
                              const updated = prizes.map(pr => pr.id === p.id ? { ...pr, color: e.target.value } : pr)
                              setPrizes(updated)
                            }}/>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={p.is_active} className="sr-only peer"
                              onChange={() => toggle(p.id, p.is_active)}/>
                            <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div className="flex items-center justify-center p-4 border-2 border-dashed border-surface-variant rounded-lg mt-4 cursor-pointer hover:border-primary transition-colors text-outline hover:text-primary">
                <span className="material-symbols-outlined mr-2">add_circle</span>
                <span className="font-label-sm text-label-sm font-medium">เพิ่มการตั้งค่าช่องใหม่</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
