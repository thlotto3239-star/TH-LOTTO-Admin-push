import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Loader2, Star, TrendingUp, Settings as SettingsIcon, ExternalLink } from 'lucide-react'

// ─── Feed Preview Page (Read-only) ─────────────────────────────────────────────
// หน้านี้แสดง preview รายการที่ถูกเปิด toggle Popular/Trending จากในหน้า "ตลาดหวย"
// การตั้งค่าให้ทำที่ LotteryMarkets เท่านั้น (single source of truth)
export default function FeedManagement() {
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)
  const [instantSettings, setInstantSettings] = useState({ name: 'หวย 1 นาที', logo_url: '', show_popular: false, show_trending: true })

  const loadAll = async () => {
    setLoading(true)
    const [marketsRes, instantRes] = await Promise.all([
      supabase.from('lottery_markets')
        .select('id, name, code, show_in_popular, show_in_trending, display_order, logo_url')
        .eq('is_active', true)
        .order('display_order', { ascending: true }),
      supabase.from('settings').select('key,value')
        .in('key', ['instant_name','instant_logo_url','instant_show_popular','instant_show_trending'])
    ])
    setMarkets(marketsRes.data || [])
    if (instantRes.data) {
      const m = {}
      instantRes.data.forEach(s => { m[s.key] = s.value })
      setInstantSettings({
        name: m.instant_name || 'หวย 1 นาที',
        logo_url: m.instant_logo_url || '',
        show_popular: m.instant_show_popular === 'true',
        show_trending: m.instant_show_trending !== 'false',
      })
    }
    setLoading(false)
  }

  useEffect(() => { loadAll() }, [])

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-emerald-800" size={32}/></div>
  }

  const popular = markets.filter(m => m.show_in_popular)
  const trending = markets.filter(m => m.show_in_trending)

  const FeedCard = ({ icon, color, title, items, instantOn, accentBg, accentText, accentBorder }) => (
    <div className="rounded-3xl p-6" style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.35)', boxShadow: '0 4px 16px -4px rgba(6,78,59,0.07)' }}>
      <div className="flex items-center gap-2 mb-5">
        {icon}
        <h3 className="font-bold text-[#022c22] text-base">{title}</h3>
        <span className="ml-auto text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
          {items.length + (instantOn ? 1 : 0)} รายการ
        </span>
      </div>
      <div className="space-y-2">
        {/* หวย 1 นาที */}
        {instantOn && (
          <div className={`flex items-center gap-3 ${accentBg} border ${accentBorder} rounded-2xl px-4 py-3`}>
            {instantSettings.logo_url
              ? <img src={instantSettings.logo_url} className="w-10 h-10 rounded-full object-cover" alt="" />
              : <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center text-xl">🎲</div>}
            <div className="flex-1 min-w-0">
              <div className={`font-bold ${accentText} truncate`}>{instantSettings.name}</div>
              <div className="text-xs font-mono text-slate-500">หวย 1 นาที</div>
            </div>
          </div>
        )}
        {/* หวยหลัก */}
        {items.map(m => (
          <div key={m.id} className={`flex items-center gap-3 ${accentBg} border ${accentBorder} rounded-2xl px-4 py-3`}>
            {m.logo_url
              ? <img src={m.logo_url} className="w-10 h-10 rounded-full object-cover" alt="" />
              : <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center text-xs font-black text-slate-500">{m.code?.slice(0,2)}</div>}
            <div className="flex-1 min-w-0">
              <div className={`font-bold ${accentText} truncate`}>{m.name}</div>
              <div className="text-xs font-mono text-slate-500">{m.code}</div>
            </div>
          </div>
        ))}
        {items.length === 0 && !instantOn && (
          <p className="text-sm text-slate-400 italic text-center py-6">ไม่มีรายการ</p>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6 pb-12" >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#022c22]">หน้าฟีด (ดูเฉย ๆ)</h1>
          <p className="text-slate-500 mt-1 text-sm">
            แสดงรายการที่ถูกเปิด toggle จากหน้า <strong>ตลาดหวย</strong> และ <strong>ตั้งค่าหวย 1 นาที</strong>
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/markets" className="flex items-center gap-2 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 px-4 py-2.5 rounded-2xl text-sm font-bold transition">
            <SettingsIcon size={16}/> จัดการตลาดหวย
            <ExternalLink size={12}/>
          </Link>
          <Link to="/instant-settings" className="flex items-center gap-2 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 px-4 py-2.5 rounded-2xl text-sm font-bold transition">
            <SettingsIcon size={16}/> หวย 1 นาที
            <ExternalLink size={12}/>
          </Link>
        </div>
      </div>

      {/* แจ้งเตือนผู้ใช้งาน */}
      <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900 flex items-start gap-2">
        <span className="text-base">ℹ️</span>
        <div>
          <strong>หน้านี้ดูเฉย ๆ ไม่สามารถแก้ไขได้</strong> — การตั้งค่าให้ไปที่หน้า "ตลาดหวย" (toggle Popular/Hot ในแต่ละตลาด) หรือ "ตั้งค่าหวย 1 นาที"
        </div>
      </div>

      {/* 2 Feed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeedCard
          icon={<Star size={20} className="text-[#064e3b]"/>}
          title="ยอดนิยม (Popular)"
          items={popular}
          instantOn={instantSettings.show_popular}
          accentBg="bg-emerald-50"
          accentText="text-emerald-900"
          accentBorder="border-emerald-200"
        />
        <FeedCard
          icon={<TrendingUp size={20} className="text-[#ba1a1a]"/>}
          title="มาแรง (Trending)"
          items={trending}
          instantOn={instantSettings.show_trending}
          accentBg="bg-red-50"
          accentText="text-red-900"
          accentBorder="border-red-200"
        />
      </div>
    </div>
  )
}
