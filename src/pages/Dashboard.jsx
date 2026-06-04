import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import {
  Users, Wallet, ArrowDownCircle, ArrowUpCircle, TrendingUp,
  ListOrdered, AlertTriangle, RefreshCw, Clock, Banknote, Receipt, Trophy, Gift, Wrench, Timer, Activity, Loader2
} from 'lucide-react'
import BankBadge from '../components/BankBadge'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const fmt = (n) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 0 })

function KPICard({ icon: Icon, label, value, sub, alert, iconBg = 'bg-primary/10 text-primary' }) {
  return (
    <div className={`bg-surface-container-lowest rounded-2xl p-3 md:p-5 shadow-glass border border-outline-variant/20 relative overflow-hidden group hover:shadow-capsule transition-all duration-300 ${alert ? 'ring-2 ring-error/60' : ''}`}>
      <div className="flex items-center gap-2.5 md:gap-4">
        <div className={`p-2 md:p-3 rounded-xl ${iconBg} shrink-0`}>
          <Icon size={18} className="md:size-[22px]" strokeWidth={2}/>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] md:text-xs font-medium text-on-surface-variant uppercase tracking-wider truncate">{label}</p>
          <h2 className="text-lg md:text-2xl font-bold text-on-surface mt-0.5 truncate">{value}</h2>
          {sub && <p className="text-[10px] md:text-xs text-outline mt-0.5 truncate">{sub}</p>}
        </div>
        {alert && (
          <span className="hidden md:inline-flex flex-shrink-0 px-2.5 py-1 bg-error/10 text-error rounded-full text-[10px] font-bold uppercase tracking-wide animate-pulse">
            รอดำเนินการ
          </span>
        )}
      </div>
      {alert && (
        <span className="md:hidden absolute top-2 right-2 w-2 h-2 bg-error rounded-full animate-pulse"></span>
      )}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats]     = useState(null)
  const [advancedStats, setAdvancedStats] = useState(null)
  const [chart, setChart]     = useState([])
  const [feed, setFeed]       = useState([])
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  const loadAll = useCallback(async () => {
    const [statsRes, advancedRes, chartRes, marketsRes, depRes, withRes, betRes, banksRes] = await Promise.all([
      supabase.rpc('admin_dashboard_stats'),
      supabase.rpc('admin_dashboard_advanced_stats'),
      supabase.from('transactions')
        .select('type,amount,created_at')
        .in('type', ['DEPOSIT','WIN','PAYOUT','BET'])
        .gte('created_at', new Date(Date.now() - 7*24*60*60*1000).toISOString())
        .order('created_at'),
      supabase.rpc('get_markets_with_countdown'),
      supabase.from('deposit_requests')
        .select('id, amount, status, created_at, profiles:profiles!user_id(full_name, member_id, bank_name, bank_account_number, bank_account_name, avatar_url)')
        .order('created_at', { ascending: false })
        .limit(30),
      supabase.from('withdraw_requests')
        .select('id, amount, status, created_at, bank_name, bank_account_number, bank_account_name, profiles:profiles!user_id(full_name, member_id, avatar_url)')
        .order('created_at', { ascending: false })
        .limit(30),
      supabase.from('bets')
        .select('id, numbers, bet_type, amount, created_at, profiles:profiles!user_id(full_name, member_id, avatar_url), lottery_markets(name, logo_url, category, code, type)')
        .order('created_at', { ascending: false })
        .limit(30),
      supabase.from('banks').select('code, name, image_url')
    ])

    // สร้าง map ของธนาคาร: code → {name, image_url}
    const banksMap = {}
    ;(banksRes.data || []).forEach(b => { banksMap[b.code] = b })

    if (statsRes.data) setStats(statsRes.data)
    
    // Check advanced stats. If database function has permission/schema issues, fallback inside JS!
    if (advancedRes.data && !advancedRes.error) {
      setAdvancedStats(advancedRes.data)
    } else {
      // Robust Fallback Calculation
      const allBets = betRes.data || []
      const uniqueBettors = new Set(allBets.map(b => b.profiles?.member_id).filter(Boolean))
      
      const totalBetsToday = allBets.reduce((sum, b) => sum + Number(b.amount || 0), 0)
      const betRate = uniqueBettors.size > 0 ? (allBets.length / uniqueBettors.size).toFixed(1) : '0'

      const totalDep = (depRes.data || []).reduce((sum, d) => sum + Number(d.amount || 0), 0)
      const totalWith = (withRes.data || []).reduce((sum, w) => sum + Number(w.amount || 0), 0)
      const withRate = totalDep > 0 ? ((totalWith / totalDep) * 100).toFixed(0) : '0'

      // Top Bettor
      const bettorSum = {}
      allBets.forEach(b => {
        if (b.profiles?.full_name) {
          bettorSum[b.profiles.full_name] = (bettorSum[b.profiles.full_name] || 0) + Number(b.amount || 0)
        }
      })
      const sortedBettors = Object.entries(bettorSum).sort((a,b) => b[1] - a[1])

      setAdvancedStats({
        active_members_7d: uniqueBettors.size,
        bet_rate_per_person: Number(betRate),
        withdrawal_rate: Number(withRate),
        top_10_bettors: sortedBettors.map(([name, sum]) => ({ full_name: name, total_bet: sum }))
      })
    }
    
    let combinedFeed = []
    
    // Process Deposits (ใช้ bank ของผู้ใช้จาก profiles)
    ;(depRes.data || []).forEach(d => {
      const bankCode = d.profiles?.bank_name
      combinedFeed.push({
        id: `dep-${d.id}`,
        type: 'DEPOSIT',
        status: d.status,
        amount: d.amount,
        created_at: d.created_at,
        profiles: d.profiles,
        bank_code: bankCode,
        bank_info: banksMap[bankCode] || null,
        bank_account_number: d.profiles?.bank_account_number,
        bank_account_name: d.profiles?.bank_account_name,
      })
    })

    // Process Withdraws (ใช้ bank จาก withdraw_requests โดยตรง)
    ;(withRes.data || []).forEach(w => {
      const bankCode = w.bank_name
      combinedFeed.push({
        id: `with-${w.id}`,
        type: 'WITHDRAW',
        status: w.status,
        amount: w.amount,
        created_at: w.created_at,
        profiles: w.profiles,
        bank_code: bankCode,
        bank_info: banksMap[bankCode] || null,
        bank_account_number: w.bank_account_number,
        bank_account_name: w.bank_account_name,
      })
    })

    // Process Bets (Exclude 1-minute lottery)
    ;(betRes.data || []).forEach(b => {
      if (
        b.lottery_markets?.category === 'instant' || 
        b.lottery_markets?.code?.includes('1M') || 
        b.lottery_markets?.type === 'instant'
      ) {
        return
      }

      combinedFeed.push({
        id: `bet-${b.id}`,
        type: 'BET',
        status: 'COMPLETED',
        amount: b.amount,
        created_at: b.created_at,
        profiles: b.profiles,
        lottery_markets: b.lottery_markets,
        note: `เลขที่แทง: ${b.numbers} (${b.bet_type})`
      })
    })

    // Process Lottery Alerts/Status
    if (marketsRes.data) {
      setMarkets(marketsRes.data)
      marketsRes.data.forEach(m => {
        // Limit push alerts to only active non-instant markets to keep clean
        if (m.category === 'instant' || m.code?.includes('1M')) return

        if (!m.is_open && m.results) {
          combinedFeed.push({
            isAlert: true, 
            type: 'LOTTERY_RESULT', 
            created_at: new Date().toISOString(), 
            lottery_markets: m, 
            note: `ประกาศผลรางวัลแล้ว`
          })
        } else if (!m.is_open) {
          combinedFeed.push({
            isAlert: true, 
            type: 'LOTTERY_CLOSED', 
            created_at: new Date().toISOString(), 
            lottery_markets: m, 
            note: `ปิดรับแทงแล้ว`
          })
        } else if (m.is_open && m.countdown) {
          const parts = m.countdown.split(':')
          if (parts.length === 3) {
            const h = parseInt(parts[0], 10), min = parseInt(parts[1], 10)
            if (h === 0 && min <= 10) {
              combinedFeed.push({
                isAlert: true, 
                type: 'LOTTERY_ALERT', 
                created_at: new Date().toISOString(), 
                lottery_markets: m, 
                note: `ใกล้จะปิดรับ (เหลือ ${m.countdown} นาที)`
              })
            }
          }
        }
      })
    }
    
    combinedFeed.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    setFeed(combinedFeed.slice(0, 30))

    if (chartRes.data) {
      const byDay = {}
      chartRes.data.forEach(t => {
        const day = new Date(t.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
        if (!byDay[day]) byDay[day] = { day, ฝาก: 0, แทง: 0, จ่ายรางวัล: 0 }
        if (t.type === 'DEPOSIT') byDay[day].ฝาก += Number(t.amount)
        if (t.type === 'BET') byDay[day].แทง += Number(t.amount)
        if (['WIN','PAYOUT'].includes(t.type)) byDay[day].จ่ายรางวัล += Number(t.amount)
      })
      setChart(Object.values(byDay).slice(-7))
    }
    setLastUpdate(new Date())
    setLoading(false)
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  // Realtime subscription
  useEffect(() => {
    const ch = supabase.channel('admin-dashboard')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'deposit_requests' }, loadAll)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'withdraw_requests' }, loadAll)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bets' }, loadAll)
      .subscribe()
    const timer = setInterval(loadAll, 60000)
    return () => { supabase.removeChannel(ch); clearInterval(timer) }
  }, [loadAll])

  const FeedIcon = ({ type, item }) => {
    if (type === 'LOTTERY_ALERT' && item?.lottery_markets?.logo_url) {
      return <img src={item.lottery_markets.logo_url} alt="" className="w-9 h-9 rounded-full object-contain border border-outline-variant p-0.5 bg-white"/>
    }
    if (type === 'BET' && item?.lottery_markets?.logo_url) {
      return <img src={item.lottery_markets.logo_url} alt="" className="w-9 h-9 rounded-full object-contain border border-outline-variant p-0.5 bg-white"/>
    }
    if ((type === 'DEPOSIT' || type === 'WITHDRAW') && item?.bank_name) {
      return <BankBadge code={item.bank_name} size="md" />
    }
    
    const map = {
      LOTTERY_ALERT:  { icon: Timer, bg: 'bg-orange-50 text-orange-600' },
      LOTTERY_CLOSED: { icon: Clock, bg: 'bg-gray-100 text-gray-500' },
      LOTTERY_RESULT: { icon: Trophy, bg: 'bg-green-50 text-green-600' },
      DEPOSIT:     { icon: ArrowDownCircle, bg: 'bg-emerald-50 text-emerald-600' },
      WITHDRAW:    { icon: ArrowUpCircle, bg: 'bg-red-50 text-red-505' },
      BET:         { icon: Receipt, bg: 'bg-blue-50 text-blue-600' },
    }
    const config = map[type] || { icon: Receipt, bg: 'bg-surface-container text-on-surface-variant' }
    const IconComp = config.icon
    return (
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${config.bg}`}>
        <IconComp size={18}/>
      </div>
    )
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-primary" size={32}/>
    </div>
  )

  const s = stats || {}

  return (
    <div className="space-y-6 pb-10" style={{ fontFamily: 'Prompt, sans-serif' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-on-surface tracking-tight">ภาพรวมระบบ</h1>
          <p className="text-sm text-on-surface-variant mt-1 flex items-center gap-1.5 font-medium">
            <Clock size={14} className="text-primary"/> อัปเดตล่าสุด: {lastUpdate.toLocaleTimeString('th-TH')} น.
          </p>
        </div>
        <button onClick={loadAll} className="flex items-center gap-2 px-5 py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-bold rounded-full text-sm transition-all duration-200 active:scale-95 shadow-sm">
          <RefreshCw size={14} className="text-emerald-700"/> รีเฟรชข้อมูล
        </button>
      </div>

      {/* KPI Row */}
      <section className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        <KPICard icon={Users}           label="สมาชิกทั้งหมด"   value={fmt(s.total_members)}     sub={`ใหม่วันนี้ +${fmt(s.new_today)}`}   iconBg="bg-blue-50 text-blue-600" />
        <KPICard icon={Wallet}          label="เงินรวมในระบบ"    value={`฿${fmt(s.total_balance)}`} sub={`ฝากวันนี้ ฿${fmt(s.today_deposit)}`} iconBg="bg-emerald-50 text-emerald-600" />
        <KPICard icon={ArrowDownCircle} label="รออนุมัติฝาก"   value={fmt(s.pending_deposits)}  alert={s.pending_deposits > 0} iconBg="bg-amber-50 text-amber-600" />
        <KPICard icon={ArrowUpCircle}   label="รออนุมัติถอน"   value={fmt(s.pending_withdraws)} alert={s.pending_withdraws > 0} iconBg="bg-red-50 text-red-500" />
      </section>

      {/* Secondary Stats Row */}
      <section className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        <KPICard icon={ListOrdered}  label="ยอดแทงวันนี้"  value={`฿${fmt(s.today_bets)}`}       iconBg="bg-blue-50 text-blue-600" />
        <KPICard icon={AlertTriangle} label="จ่ายรางวัลวันนี้" value={`฿${fmt(s.today_payouts)}`} iconBg="bg-orange-50 text-orange-600" />
        <div className="bg-primary rounded-2xl p-5 shadow-capsule-md flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary-container/30 text-primary-fixed">
            <TrendingUp size={22}/>
          </div>
          <div>
            <p className="text-xs font-medium text-primary-fixed-dim uppercase tracking-wider">กำไรสุทธิวันนี้</p>
            <h2 className="text-2xl font-bold text-on-primary mt-0.5">฿{fmt(s.today_bets - s.today_payouts)}</h2>
          </div>
        </div>
        <KPICard icon={ListOrdered} label="ตลาดเปิดอยู่" value={markets.filter(m => m.is_open).length} sub={`จากทั้งหมด ${markets.length} ตลาด`} iconBg="bg-teal-50 text-teal-600" />
      </section>

      {/* Advanced Stats Row */}
      {advancedStats && (
        <section className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
          <KPICard icon={Users} label="สมาชิกใช้งาน (7 วัน)" value={fmt(advancedStats.active_members_7d)} sub="สมาชิกที่แทงหวย" iconBg="bg-purple-50 text-purple-600" />
          <KPICard icon={Receipt} label="อัตราแทงต่อคน" value={advancedStats.bet_rate_per_person} sub="ครั้งต่อคน" iconBg="bg-indigo-50 text-indigo-600" />
          <KPICard icon={ArrowUpCircle} label="อัตราการถอน" value={`${advancedStats.withdrawal_rate}%`} sub="เทียบกับฝาก" iconBg="bg-pink-50 text-pink-600" />
          <KPICard icon={Trophy} label="คนแทงสูงสุด (7 วัน)" value={advancedStats.top_10_bettors?.[0]?.full_name || '-'} sub={`฿${fmt(advancedStats.top_10_bettors?.[0]?.total_bet)}`} iconBg="bg-amber-50 text-amber-600" />
        </section>
      )}

      {/* Chart + Markets */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* REAL-TIME FEED (Timeline style) */}
        <div className="glass-panel rounded-2xl shadow-glass flex flex-col h-[520px]">
          <div className="p-5 border-b border-outline-variant/20 flex items-center justify-between">
            <h3 className="font-bold text-on-surface flex items-center gap-2">
              <Activity size={18} className="text-primary" /> ความเคลื่อนไหวเรียลไทม์
            </h3>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              สด
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 relative" style={{ scrollbarWidth: 'none' }}>
            {/* Vertical Line */}
            <div className="absolute top-6 bottom-6 left-[43px] w-0.5 bg-slate-100"></div>
            
            <div className="space-y-5 relative">
              {feed.length === 0 && <div className="text-center text-slate-400 py-12">ไม่มีข้อมูลล่าสุด</div>}
              {feed.map((f, i) => {
                const typeLabel = { DEPOSIT:'ฝากเงิน', WITHDRAW:'ถอนเงิน', BET:'แทงหวย', LOTTERY_RESULT:'ประกาศผล', LOTTERY_CLOSED:'ปิดรับ', LOTTERY_ALERT:'แจ้งเตือน' }
                
                let typeColor = 'text-on-surface-variant'
                let amountColor = 'text-on-surface'
                let badgeColor = 'bg-surface-container'
                let amountSign = ''
                
                if (f.type === 'DEPOSIT') {
                  if (f.status === 'PENDING') { typeColor = 'text-orange-500'; amountColor = 'text-orange-500'; badgeColor = 'bg-orange-100 text-orange-600' }
                  else if (f.status === 'APPROVED' || f.status === 'SUCCESS') { typeColor = 'text-emerald-600'; amountColor = 'text-emerald-600'; amountSign = '+'; badgeColor = 'bg-emerald-100 text-emerald-600' }
                  else { typeColor = 'text-error'; amountColor = 'text-error'; badgeColor = 'bg-error-container text-error' }
                } else if (f.type === 'WITHDRAW') {
                  if (f.status === 'PENDING') { typeColor = 'text-orange-500'; amountColor = 'text-orange-500'; badgeColor = 'bg-orange-100 text-orange-600' }
                  else if (f.status === 'APPROVED' || f.status === 'SUCCESS') { typeColor = 'text-red-500'; amountColor = 'text-red-500'; amountSign = '-'; badgeColor = 'bg-red-100 text-red-600' }
                  else { typeColor = 'text-error'; amountColor = 'text-error'; badgeColor = 'bg-error-container text-error' }
                } else if (f.type === 'BET') {
                  typeColor = 'text-on-surface'
                  amountColor = 'text-on-surface font-bold'
                  badgeColor = 'bg-blue-100 text-blue-600'
                }

                return (
                  <div key={f.id || i} className="flex gap-4 relative">
                    {/* Icon Circle */}
                    <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-[3px] border-white shadow-sm ${badgeColor}`}>
                      <FeedIcon type={f.type} item={f} />
                    </div>
                    
                    {/* Content Box */}
                    <div className="flex-1 bg-white/60 hover:bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm transition">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${typeColor}`}>
                            {typeLabel[f.type] || f.type}
                          </span>
                          {f.status === 'PENDING' && (
                            <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-black uppercase animate-pulse">รอตรวจสอบ</span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 font-mono">{new Date(f.created_at).toLocaleTimeString('th-TH', { hour:'2-digit', minute:'2-digit' })}</span>
                      </div>

                      {f.isAlert ? (
                        <p className={`text-sm font-bold mt-1 ${f.type === 'LOTTERY_RESULT' ? 'text-emerald-600' : f.type === 'LOTTERY_CLOSED' ? 'text-slate-500' : 'text-error'}`}>
                          {f.type === 'LOTTERY_ALERT' && '🚨 '} {f.note}
                        </p>
                      ) : (
                        <div className="text-sm mt-1 space-y-1.5">
                          {/* ชื่อผู้ใช้ (ทั้งสมาชิก) */}
                          {f.profiles && (
                            <div className="flex items-center gap-1.5 text-on-surface-variant">
                              {f.profiles.avatar_url ? (
                                <img src={f.profiles.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover border border-slate-100 shrink-0" />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-emerald-800/10 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                                  {(f.profiles.full_name || '?')[0].toUpperCase()}
                                </div>
                              )}
                              <span className="font-bold text-emerald-950 truncate">{f.profiles.full_name || `@${f.profiles.member_id}`}</span>
                              {f.profiles.member_id && <span className="text-[10px] text-slate-400 font-mono">@{f.profiles.member_id}</span>}
                            </div>
                          )}

                          {/* ── สำหรับฝาก/ถอน: แสดงโลโก้ธนาคาร + เลขบัญชี ── */}
                          {(f.type === 'DEPOSIT' || f.type === 'WITHDRAW') && (f.bank_info || f.bank_account_number) && (
                            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5">
                              {f.bank_info?.image_url ? (
                                <img src={f.bank_info.image_url} alt="" className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0" />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 text-[9px] font-black flex items-center justify-center shrink-0">
                                  {(f.bank_code || '?').slice(0, 3)}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="text-[11px] font-bold text-slate-700 truncate">{f.bank_info?.name || f.bank_code || 'ไม่ระบุธนาคาร'}</div>
                                {f.bank_account_number && <div className="text-[10px] font-mono text-slate-500">{f.bank_account_number}</div>}
                              </div>
                            </div>
                          )}

                          {/* ── สำหรับ BET: แสดงโลโก้หวย + ประเภท ── */}
                          {f.type === 'BET' && f.lottery_markets && (
                            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5">
                              {f.lottery_markets.logo_url ? (
                                <img src={f.lottery_markets.logo_url} alt="" className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0" />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-[9px] font-black flex items-center justify-center shrink-0">
                                  {(f.lottery_markets.code || '?').slice(0, 3)}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="text-[11px] font-bold text-slate-700 truncate">{f.lottery_markets.name}</div>
                                <div className="text-[10px] text-slate-500 font-mono truncate">{f.note}</div>
                              </div>
                            </div>
                          )}

                          {/* ── ยอดเงิน ── */}
                          <div className={`font-bold text-sm ${amountColor}`}>
                            {f.type === 'DEPOSIT' && 'ยอดฝาก '}
                            {f.type === 'WITHDRAW' && 'ยอดถอน '}
                            {f.type === 'BET' && 'ยอดเดิมพัน '}
                            <span className="text-base font-black">{amountSign}฿{fmt(Math.abs(f.amount))}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="xl:col-span-2 glass-panel rounded-2xl shadow-glass p-6 flex flex-col h-[520px]">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-bold text-[#022c22] text-lg">วิเคราะห์การเงิน (7 วันล่าสุด)</h3>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5eeff" vertical={false}/>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#707974' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#707974' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => [`฿${fmt(v)}`, '']} contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Bar dataKey="ฝาก"       fill="#10b981" radius={[6,6,0,0]} />
                <Bar dataKey="แทง"       fill="#3b82f6" radius={[6,6,0,0]} />
                <Bar dataKey="จ่ายรางวัล" fill="#f43f5e" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Market Status — with logos */}
      <section className="glass-panel rounded-2xl shadow-glass p-6 flex flex-col max-h-[420px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-[#022c22] text-lg">ตลาดหวยเปิดรับแทง</h3>
          <span className="text-xs text-emerald-800 font-bold bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">{markets.filter(m => m.is_open).length} เปิดอยู่</span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1" style={{ scrollbarWidth: 'none' }}>
          {markets.length === 0 && <div className="text-outline text-sm text-center py-8">ไม่มีตลาดที่เปิดรับแทงในขณะนี้</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {markets.map(m => {
              if (m.category === 'instant' || m.code?.includes('1M')) return null

              return (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white/50 border border-slate-100 hover:bg-white transition-all shadow-sm">
                  {/* Market Logo */}
                  {m.logo_url ? (
                    <img src={m.logo_url} alt={m.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 bg-white flex-shrink-0"/>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-800 font-black text-sm flex-shrink-0">
                      {m.code?.slice(0,2) || m.name?.slice(0,1)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-emerald-950 truncate">{m.name}</p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {m.draw_time?.slice(0, 5) || '—'} น.
                      {m.countdown && <span className="ml-1.5 font-mono text-primary font-bold bg-emerald-50 px-1.5 py-0.5 rounded">{m.countdown}</span>}
                    </p>
                  </div>
                  <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold ${m.is_open ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                    {m.is_open ? '● เปิด' : '○ ปิด'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Realtime Feed — Professional table-style */}
      <section className="glass-panel rounded-2xl shadow-glass overflow-hidden border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-white/40">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-[#022c22] text-lg">ประวัติรายการเรียลไทม์</h3>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10b981]"></span>
            </span>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{feed.length} รายการล่าสุด</span>
        </div>
        <div className="max-h-[420px] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#0f1f1a]/5 text-[#022c22] font-bold text-xs uppercase tracking-wider sticky top-0 bg-slate-50 z-20">
                <tr>
                  <th className="px-6 py-4">เวลาทำรายการ</th>
                  <th className="px-6 py-4">ประเภท</th>
                  <th className="px-6 py-4">ผู้ใช้งาน</th>
                  <th className="px-6 py-4">รายละเอียดกิจกรรม</th>
                  <th className="px-6 py-4 text-right">จำนวนเงิน</th>
                  <th className="px-6 py-4 text-center">สถานะการทำงาน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white/40">
                {feed.map((f, idx) => {
                  const typeLabel = { DEPOSIT: 'ฝากเงิน', WITHDRAW: 'ถอนเงิน', BET: 'แทงหวย', LOTTERY_RESULT: 'ประกาศผล', LOTTERY_CLOSED: 'ปิดรับ', LOTTERY_ALERT: 'แจ้งเตือน' }
                  
                  let badgeCls = 'bg-slate-100 text-slate-600'
                  if (f.type === 'DEPOSIT') badgeCls = 'bg-emerald-100 text-emerald-800'
                  else if (f.type === 'WITHDRAW') badgeCls = 'bg-rose-100 text-rose-800'
                  else if (f.type === 'BET') badgeCls = 'bg-blue-100 text-blue-800'
                  else if (f.type.startsWith('LOTTERY')) badgeCls = 'bg-amber-100 text-amber-800'

                  let statusCls = 'bg-slate-100 text-slate-700'
                  let statusLabel = f.status || 'สำเร็จ'
                  if (f.status === 'PENDING') {
                    statusCls = 'bg-amber-100 text-amber-800 animate-pulse'
                    statusLabel = 'รออนุมัติ'
                  } else if (f.status === 'APPROVED' || f.status === 'SUCCESS' || f.status === 'COMPLETED') {
                    statusCls = 'bg-emerald-100 text-emerald-800'
                    statusLabel = 'สำเร็จ'
                  } else if (f.status === 'REJECTED') {
                    statusCls = 'bg-rose-100 text-rose-800'
                    statusLabel = 'ปฏิเสธ'
                  }

                  return (
                    <tr key={f.id || idx} className="hover:bg-white/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-mono text-xs">
                        {new Date(f.created_at).toLocaleString('th-TH')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${badgeCls}`}>
                          {typeLabel[f.type] || f.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {f.profiles ? (
                          <div className="flex items-center gap-2">
                            {f.profiles.avatar_url ? (
                              <img src={f.profiles.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover border border-slate-200" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-emerald-800/10 text-emerald-800 text-[10px] font-bold flex items-center justify-center">
                                {(f.profiles.full_name || '?')[0].toUpperCase()}
                              </div>
                            )}
                            <span className="font-bold text-emerald-950">@{f.profiles.member_id || f.profiles.full_name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-medium">ระบบอัตโนมัติ</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-semibold max-w-xs truncate">
                        {f.isAlert ? f.note : (f.type === 'BET' ? `${f.lottery_markets?.name || 'หวย'} · ${f.note}` : `ทำรายการ${typeLabel[f.type]}`)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-mono font-bold text-slate-900 text-base">
                        {f.amount ? `฿${fmt(f.amount)}` : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusCls}`}>
                          {statusLabel}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
