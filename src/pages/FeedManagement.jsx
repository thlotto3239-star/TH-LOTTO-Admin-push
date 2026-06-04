import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Loader2, Save, Eye, Star, TrendingUp } from 'lucide-react'
import { toast } from '../components/Toast'

// ─── DayPill or Toggle Switch ──────────────────────────────────────────────────
function Toggle({ checked, onChange, activeColor = 'bg-[#064e3b]' }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${checked ? activeColor : 'bg-slate-200'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow border border-slate-200 transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`} />
    </button>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FeedManagement() {
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [instantSettings, setInstantSettings] = useState({ name: 'หวย 1 นาที', logo_url: '', show_popular: false, show_trending: true })

  const loadInstantSettings = async () => {
    const { data } = await supabase.from('settings').select('key,value')
      .in('key', ['instant_name','instant_logo_url','instant_show_popular','instant_show_trending'])
    if (data) {
      const m = {}
      data.forEach(s => { m[s.key] = s.value })
      setInstantSettings({
        name: m.instant_name || 'หวย 1 นาที',
        logo_url: m.instant_logo_url || '',
        show_popular: m.instant_show_popular === 'true',
        show_trending: m.instant_show_trending !== 'false',
      })
    }
  }

  const loadMarkets = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('lottery_markets')
      .select('id, name, type, code, show_in_popular, show_in_trending, display_order, image_url, logo_url')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true })
    
    if (error) {
      toast.error('โหลดข้อมูลตลาดหวยล้มเหลว: ' + error.message)
    } else {
      setMarkets(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadMarkets()
    loadInstantSettings()
  }, [])

  const toggleFeed = (id, field) => {
    setMarkets(prev => prev.map(m => 
      m.id === id ? { ...m, [field]: !m[field] } : m
    ))
  }

  const moveUp = (index) => {
    if (index === 0) return
    const newMarkets = [...markets]
    const temp = newMarkets[index]
    newMarkets[index] = newMarkets[index - 1]
    newMarkets[index - 1] = temp
    
    // Update display orders
    newMarkets.forEach((m, i) => m.display_order = i + 1)
    setMarkets(newMarkets)
  }

  const moveDown = (index) => {
    if (index === markets.length - 1) return
    const newMarkets = [...markets]
    const temp = newMarkets[index]
    newMarkets[index] = newMarkets[index + 1]
    newMarkets[index + 1] = temp
    
    // Update display orders
    newMarkets.forEach((m, i) => m.display_order = i + 1)
    setMarkets(newMarkets)
  }

  const saveChanges = async () => {
    setSaving(true)
    try {
      const promises = markets.map(m => 
        supabase.from('lottery_markets').update({
          show_in_popular: m.show_in_popular,
          show_in_trending: m.show_in_trending,
          display_order: m.display_order
        }).eq('id', m.id)
      )
      await Promise.all(promises)
      toast.success('บันทึกการตั้งค่าฟีดสำเร็จ')
      loadMarkets()
    } catch (e) {
      toast.error('เกิดข้อผิดพลาดในการบันทึก: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-emerald-800" size={32}/>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12" style={{ fontFamily: 'Prompt, sans-serif' }}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[#022c22]">จัดการหน้าฟีดตลาดหวย</h1>
          <p className="text-slate-500 mt-2 text-base">
            เลือกหวยที่ต้องการแสดงในหมวด "ยอดนิยม" (Popular) และ "มาแรง" (Trending) บนหน้าแรก พร้อมจัดลำดับการแสดงผล
          </p>
        </div>
        <button 
          onClick={saveChanges}
          disabled={saving}
          className="flex items-center gap-3 bg-[#064e3b] hover:bg-[#043d2e] text-white px-8 py-4 rounded-full font-bold shadow-xl shadow-emerald-900/20 transition-all active:scale-95 disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          )}
          บันทึกการจัดอันดับ
        </button>
      </div>

      {/* Table Card */}
      <div 
        className="rounded-3xl p-6 overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.35)',
          boxShadow: '0 4px 16px -4px rgba(6,78,59,0.07)',
        }}
      >
        {/* Table Head */}
        <div className="grid grid-cols-12 gap-4 pb-4 border-b border-slate-100 font-bold text-sm text-[#022c22] px-4">
          <div className="col-span-2 text-center">จัดลำดับ</div>
          <div className="col-span-4">รายการหวย</div>
          <div className="col-span-3 text-center">ยอดนิยม (Popular)</div>
          <div className="col-span-3 text-center">มาแรง (Trending)</div>
        </div>

        {/* Table Rows */}
        <div className="space-y-3 mt-4">
          {markets.map((m, idx) => {
            const imgToUse = m.logo_url || m.image_url

            return (
              <div 
                key={m.id} 
                className="grid grid-cols-12 gap-4 items-center bg-white/70 hover:bg-white p-4 rounded-2xl border border-slate-100 shadow-sm transition-all duration-300"
              >
                {/* Order buttons */}
                <div className="col-span-2 flex items-center justify-center gap-2">
                  <button 
                    onClick={() => moveUp(idx)} 
                    disabled={idx === 0} 
                    className="w-8 h-8 rounded-full bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-[#064e3b] flex items-center justify-center transition disabled:opacity-30"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>
                  </button>
                  <span className="font-mono font-bold text-emerald-950 w-6 text-center">{idx + 1}</span>
                  <button 
                    onClick={() => moveDown(idx)} 
                    disabled={idx === markets.length - 1} 
                    className="w-8 h-8 rounded-full bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-[#064e3b] flex items-center justify-center transition disabled:opacity-30"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                </div>
                
                {/* Market info */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                    {imgToUse ? (
                      <img src={imgToUse} alt={m.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-black text-slate-400">{m.code?.slice(0, 2)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-emerald-950 truncate">{m.name}</div>
                    <div className="text-xs font-mono font-bold text-slate-400 mt-0.5">{m.code}</div>
                  </div>
                </div>

                {/* Popular toggle */}
                <div className="col-span-3 flex justify-center">
                  <Toggle 
                    checked={!!m.show_in_popular} 
                    onChange={() => toggleFeed(m.id, 'show_in_popular')} 
                    activeColor="bg-[#064e3b]" 
                  />
                </div>

                {/* Trending toggle */}
                <div className="col-span-3 flex justify-center">
                  <Toggle 
                    checked={!!m.show_in_trending} 
                    onChange={() => toggleFeed(m.id, 'show_in_trending')} 
                    activeColor="bg-[#ba1a1a]" 
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Preview Section ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Popular Preview */}
        <div className="rounded-3xl p-5" style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.35)', boxShadow: '0 4px 16px -4px rgba(6,78,59,0.07)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Star size={16} className="text-[#064e3b]" />
            <span className="font-bold text-[#022c22] text-sm">ตัวอย่าง — ยอดนิยม (Popular)</span>
            <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {markets.filter(m => m.show_in_popular).length + (instantSettings.show_popular ? 1 : 0)} รายการ
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {instantSettings.show_popular && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5">
                {instantSettings.logo_url
                  ? <img src={instantSettings.logo_url} className="w-5 h-5 rounded-full object-cover" alt="" />
                  : <span className="text-sm">🎲</span>}
                <span className="text-xs font-bold text-emerald-900">{instantSettings.name}</span>
              </div>
            )}
            {markets.filter(m => m.show_in_popular).map(m => (
              <div key={m.id} className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5">
                {(m.logo_url || m.image_url)
                  ? <img src={m.logo_url || m.image_url} className="w-5 h-5 rounded-full object-cover" alt="" />
                  : <span className="text-xs font-black text-slate-400">{m.code?.slice(0,2)}</span>}
                <span className="text-xs font-bold text-emerald-900 truncate max-w-[80px]">{m.name}</span>
              </div>
            ))}
            {markets.filter(m => m.show_in_popular).length === 0 && !instantSettings.show_popular && (
              <p className="text-xs text-slate-400 italic">ยังไม่มีรายการ — เปิด toggle ยอดนิยมเพื่อแสดง</p>
            )}
          </div>
        </div>

        {/* Trending Preview */}
        <div className="rounded-3xl p-5" style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.35)', boxShadow: '0 4px 16px -4px rgba(6,78,59,0.07)' }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-[#ba1a1a]" />
            <span className="font-bold text-[#022c22] text-sm">ตัวอย่าง — มาแรง (Trending)</span>
            <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {markets.filter(m => m.show_in_trending).length + (instantSettings.show_trending ? 1 : 0)} รายการ
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {instantSettings.show_trending && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-3 py-1.5">
                {instantSettings.logo_url
                  ? <img src={instantSettings.logo_url} className="w-5 h-5 rounded-full object-cover" alt="" />
                  : <span className="text-sm">🎲</span>}
                <span className="text-xs font-bold text-red-900">{instantSettings.name}</span>
              </div>
            )}
            {markets.filter(m => m.show_in_trending).map(m => (
              <div key={m.id} className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-3 py-1.5">
                {(m.logo_url || m.image_url)
                  ? <img src={m.logo_url || m.image_url} className="w-5 h-5 rounded-full object-cover" alt="" />
                  : <span className="text-xs font-black text-slate-400">{m.code?.slice(0,2)}</span>}
                <span className="text-xs font-bold text-red-900 truncate max-w-[80px]">{m.name}</span>
              </div>
            ))}
            {markets.filter(m => m.show_in_trending).length === 0 && !instantSettings.show_trending && (
              <p className="text-xs text-slate-400 italic">ยังไม่มีรายการ — เปิด toggle มาแรงเพื่อแสดง</p>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
