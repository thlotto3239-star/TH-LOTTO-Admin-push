import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import {
  Users, Wallet, ArrowDownCircle, ArrowUpCircle, TrendingUp,
  ListOrdered, AlertTriangle, RefreshCw, Clock, Banknote, Receipt, Trophy, Gift, Wrench
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const fmt = (n) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 0 })

function KPICard({ icon: Icon, label, value, sub, alert, iconBg = 'bg-primary/10 text-primary' }) {
  return (
    <div className={`bg-surface-container-lowest rounded-2xl p-5 shadow-glass border border-outline-variant/20 relative overflow-hidden group hover:shadow-capsule transition-all duration-300 ${alert ? 'ring-2 ring-error/60' : ''}`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${iconBg}`}>
          <Icon size={22} strokeWidth={2}/>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">{label}</p>
          <h2 className="text-2xl font-bold text-on-surface mt-0.5 truncate">{value}</h2>
          {sub && <p className="text-xs text-outline mt-0.5">{sub}</p>}
        </div>
        {alert && (
          <span className="flex-shrink-0 px-2.5 py-1 bg-error/10 text-error rounded-full text-[10px] font-bold uppercase tracking-wide animate-pulse">
            รอดำเนินการ
          </span>
        )}
      </div>
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
    const [statsRes, advancedRes, chartRes, feedRes, marketsRes] = await Promise.all([
      supabase.rpc('admin_dashboard_stats'),
      supabase.rpc('admin_dashboard_advanced_stats'),
      supabase.from('transactions')
        .select('type,amount,created_at')
        .in('type', ['DEPOSIT','WIN','PAYOUT','BET'])
        .gte('created_at', new Date(Date.now() - 7*24*60*60*1000).toISOString())
        .order('created_at'),
      supabase.from('transactions')
        .select('type,amount,note,created_at,profiles(full_name,member_id),market_id,lottery_markets(name,logo_url,code)')
        .order('created_at', { ascending: false })
        .limit(20),
      supabase.rpc('get_markets_with_countdown'),
    ])
    if (statsRes.data) setStats(statsRes.data)
    if (advancedRes.data) setAdvancedStats(advancedRes.data)
    if (feedRes.data) setFeed(feedRes.data)
    if (marketsRes.data) setMarkets(marketsRes.data)

    // Group chart by day
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

  // Realtime: refresh feed on new transactions
  useEffect(() => {
    const ch = supabase.channel('admin-dashboard')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'deposit_requests' }, loadAll)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'withdraw_requests' }, loadAll)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions' }, loadAll)
      .subscribe()
    const timer = setInterval(loadAll, 60000)
    return () => { supabase.removeChannel(ch); clearInterval(timer) }
  }, [loadAll])

  const FeedIcon = ({ type, logoUrl }) => {
    if (type === 'BET' && logoUrl) {
      return <img src={logoUrl} alt="" className="w-6 h-6 rounded-full object-contain"/>
    }
    const map = {
      DEPOSIT:     { icon: ArrowDownCircle, bg: 'bg-emerald-50 text-emerald-600' },
      WITHDRAW:    { icon: ArrowUpCircle, bg: 'bg-red-50 text-red-500' },
      BET:         { icon: Receipt, bg: 'bg-blue-50 text-blue-600' },
      WIN:         { icon: Trophy, bg: 'bg-amber-50 text-amber-600' },
      PAYOUT:      { icon: Banknote, bg: 'bg-amber-50 text-amber-600' },
      BONUS:       { icon: Gift, bg: 'bg-purple-50 text-purple-600' },
      COMMISSION:  { icon: Wallet, bg: 'bg-teal-50 text-teal-600' },
      ADMIN_CREDIT:{ icon: Wrench, bg: 'bg-gray-50 text-gray-600' },
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
      <div className="text-primary animate-pulse text-lg">กำลังโหลดข้อมูล...</div>
    </div>
  )

  const s = stats || {}

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">ภาพรวมระบบ</h1>
          <p className="text-sm text-on-surface-variant mt-1 flex items-center gap-1.5">
            <Clock size={13}/> อัพเดท: {lastUpdate.toLocaleTimeString('th-TH')}
          </p>
        </div>
        <button onClick={loadAll} className="flex items-center gap-2 px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface-variant rounded-full text-sm transition">
          <RefreshCw size={14}/> รีเฟรช
        </button>
      </div>

      {/* KPI Row */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard icon={Users}           label="สมาชิกทั้งหมด"   value={fmt(s.total_members)}     sub={`ใหม่วันนี้ +${fmt(s.new_today)}`}   iconBg="bg-blue-50 text-blue-600" />
        <KPICard icon={Wallet}          label="เงินรวมในระบบ"    value={`฿${fmt(s.total_balance)}`} sub={`ฝากวันนี้ ฿${fmt(s.today_deposit)}`} iconBg="bg-emerald-50 text-emerald-600" />
        <KPICard icon={ArrowDownCircle} label="รออนุมัติฝาก"   value={fmt(s.pending_deposits)}  alert={s.pending_deposits > 0} iconBg="bg-amber-50 text-amber-600" />
        <KPICard icon={ArrowUpCircle}   label="รออนุมัติถอน"   value={fmt(s.pending_withdraws)} alert={s.pending_withdraws > 0} iconBg="bg-red-50 text-red-500" />
      </section>

      {/* Secondary Stats Row */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard icon={ListOrdered}  label="ยอดแทงวันนี้"  value={`฿${fmt(s.today_bets)}`}       iconBg="bg-blue-50 text-blue-600" />
        <KPICard icon={AlertTriangle} label="จ่ายรางวัลวันนี้" value={`฿${fmt(s.today_payouts)}`} iconBg="bg-orange-50 text-orange-600" />
        <div className="bg-primary rounded-2xl p-5 shadow-capsule-md flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary-container/30 text-primary-fixed">
            <TrendingUp size={22}/>
          </div>
          <div>
            <p className="text-xs font-medium text-primary-fixed-dim uppercase tracking-wider">กำไรสุทธิ</p>
            <h2 className="text-2xl font-bold text-on-primary mt-0.5">฿{fmt(s.today_bets - s.today_payouts)}</h2>
          </div>
        </div>
        <KPICard icon={ListOrdered} label="ตลาดเปิดอยู่" value={markets.filter(m => m.is_open).length} sub={`จากทั้งหมด ${markets.length} ตลาด`} iconBg="bg-teal-50 text-teal-600" />
      </section>

      {/* Advanced Stats Row */}
      {advancedStats && (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <KPICard icon={Users} label="สมาชิกใช้งาน (7 วัน)" value={fmt(advancedStats.active_members_7d)} sub="สมาชิกที่แทงหวย" iconBg="bg-purple-50 text-purple-600" />
          <KPICard icon={Receipt} label="อัตราแทงต่อคน" value={fmt(advancedStats.bet_rate_per_person)} sub="ครั้งต่อคน" iconBg="bg-indigo-50 text-indigo-600" />
          <KPICard icon={ArrowUpCircle} label="อัตราการถอน" value={`${fmt(advancedStats.withdrawal_rate)}%`} sub="เทียบกับฝาก" iconBg="bg-pink-50 text-pink-600" />
          <KPICard icon={Trophy} label="คนแทงสูงสุด (7 วัน)" value={advancedStats.top_10_bettors?.[0]?.full_name || '-'} sub={`฿${fmt(advancedStats.top_10_bettors?.[0]?.total_bet)}`} iconBg="bg-amber-50 text-amber-600" />
        </section>
      )}

      {/* Chart + Markets */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Bar Chart */}
        <div className="xl:col-span-2 glass-panel rounded-2xl shadow-glass p-6 flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-semibold text-on-surface">วิเคราะห์รายได้ (7 วัน)</h3>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5eeff" vertical={false}/>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#707974' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#707974' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => [`฿${fmt(v)}`, '']} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Bar dataKey="ฝาก"       fill="#10b981" radius={[6,6,0,0]} />
                <Bar dataKey="แทง"       fill="#3b82f6" radius={[6,6,0,0]} />
                <Bar dataKey="จ่ายรางวัล" fill="#f43f5e" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Market Status — with logos */}
        <div className="glass-panel rounded-2xl shadow-glass p-6 flex flex-col max-h-[420px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-on-surface">ตลาดที่เปิดรับ</h3>
            <span className="text-xs text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full">{markets.filter(m => m.is_open).length} ตลาด</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {markets.length === 0 && <div className="text-outline text-sm text-center py-8">ไม่มีตลาด</div>}
            {markets.map(m => (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low/50 hover:bg-surface-container transition-colors">
                {/* Market Logo */}
                {m.logo_url ? (
                  <img src={m.logo_url} alt={m.name} className="w-9 h-9 rounded-lg object-contain border border-outline-variant/30 bg-white flex-shrink-0"/>
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                    {m.code?.slice(0,2) || m.name?.slice(0,1)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface truncate">{m.name}</p>
                  <p className="text-[11px] text-on-surface-variant">
                    {m.draw_date ? new Date(m.draw_date).toLocaleDateString('th-TH', { day:'numeric', month:'short' }) : 'ทุกวัน'}
                    {m.countdown && <span className="ml-1.5 font-mono text-primary font-medium">{m.countdown}</span>}
                  </p>
                </div>
                <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold ${m.is_open ? 'bg-emerald-50 text-emerald-700' : 'bg-surface-container text-on-surface-variant'}`}>
                  {m.is_open ? '● เปิด' : '○ ปิด'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Realtime Feed — Professional table-style */}
      <section className="glass-panel rounded-2xl shadow-glass overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-outline-variant/20">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-on-surface">รายการเรียลไทม์</h3>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary"></span>
            </span>
          </div>
          <span className="text-xs text-on-surface-variant">{feed.length} รายการล่าสุด</span>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          <div className="divide-y divide-outline-variant/20">
            {feed.map((f, i) => {
              const typeLabel = { DEPOSIT:'ฝากเงิน', WITHDRAW:'ถอนเงิน', BET:'แทงหวย', WIN:'ถูกรางวัล', PAYOUT:'จ่ายรางวัล', BONUS:'โบนัส', COMMISSION:'คอมมิชชั่น', ADMIN_CREDIT:'Admin เพิ่ม' }
              const typeColor = { DEPOSIT:'text-emerald-600', WITHDRAW:'text-red-500', BET:'text-blue-600', WIN:'text-amber-600', PAYOUT:'text-amber-600', BONUS:'text-purple-600' }
              return (
                <div key={i} className="flex items-center gap-3 px-6 py-3 hover:bg-surface-container-low/30 transition-colors">
                  <FeedIcon type={f.type} logoUrl={f.lottery_markets?.logo_url} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold ${typeColor[f.type] || 'text-on-surface-variant'}`}>
                        {typeLabel[f.type] || f.type}
                      </span>
                      {f.lottery_markets?.name && (
                        <span className="text-[10px] bg-surface-container text-on-surface-variant px-1.5 py-0.5 rounded font-medium">{f.lottery_markets.name}</span>
                      )}
                    </div>
                    <p className="text-sm text-on-surface truncate">
                      {f.profiles?.full_name || f.profiles?.member_id || 'ระบบ'}
                      {f.note && <span className="text-on-surface-variant"> — {f.note}</span>}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-bold ${f.amount >= 0 ? 'text-on-surface' : 'text-error'}`}>
                      {f.amount >= 0 ? '+' : ''}฿{fmt(Math.abs(f.amount))}
                    </p>
                    <p className="text-[10px] text-outline">{new Date(f.created_at).toLocaleTimeString('th-TH', { hour:'2-digit', minute:'2-digit' })}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
