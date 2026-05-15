import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import {
  Users, Wallet, ArrowDownCircle, ArrowUpCircle, TrendingUp,
  ListOrdered, AlertTriangle, RefreshCw, Clock
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const fmt = (n) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 0 })

function KPICard({ icon: Icon, label, value, sub, color = 'emerald', alert }) {
  const colors = {
    emerald: 'bg-surface-container text-primary',
    blue:    'bg-surface-container text-primary',
    amber:   'bg-surface-container text-on-surface-variant',
    rose:    'bg-surface-container text-primary',
  }
  return (
    <div className={`bg-surface-container-lowest rounded-xl p-lg shadow-[0_15px_40px_rgba(6,78,59,0.05)] border border-white relative overflow-hidden group hover:shadow-[0_20px_50px_rgba(6,78,59,0.1)] transition-shadow duration-300 ${alert ? 'ring-2 ring-error' : ''}`}>
      <div className={`absolute -right-8 -top-8 w-32 h-32 bg-primary-container/5 rounded-full blur-2xl group-hover:bg-primary-container/10 transition-colors`}></div>
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className={`p-3 bg-surface-container rounded-full text-primary`}>
          <Icon size={20}/>
        </div>
        {alert && <span className="bg-surface-container text-on-surface-variant px-3 py-1 rounded-full font-label-sm text-label-sm flex items-center">รอตรวจสอบ</span>}
      </div>
      <div className="relative z-10">
        <p className="font-body-md text-body-md text-on-surface-variant mb-1">{label}</p>
        <h2 className="font-h2 text-h2 text-on-surface">{value}</h2>
      </div>
      {sub && <div className="relative z-10 text-xs text-outline mt-1">{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats]     = useState(null)
  const [chart, setChart]     = useState([])
  const [feed, setFeed]       = useState([])
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  const loadAll = useCallback(async () => {
    const [statsRes, chartRes, feedRes, marketsRes] = await Promise.all([
      supabase.rpc('admin_dashboard_stats'),
      supabase.from('transactions')
        .select('type,amount,created_at')
        .in('type', ['DEPOSIT','WIN','PAYOUT','BET'])
        .gte('created_at', new Date(Date.now() - 7*24*60*60*1000).toISOString())
        .order('created_at'),
      supabase.from('transactions')
        .select('type,amount,note,created_at,profiles(full_name,member_id)')
        .order('created_at', { ascending: false })
        .limit(20),
      supabase.rpc('get_markets_with_countdown'),
    ])
    if (statsRes.data) setStats(statsRes.data)
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

  const feedIcon = (type) => {
    const m = { DEPOSIT:'⬇️', WITHDRAW:'⬆️', BET:'🎰', WIN:'🎉', PAYOUT:'💰', BONUS:'🎁', COMMISSION:'💼', ADMIN_CREDIT:'🔧' }
    return m[type] || '📌'
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-primary animate-pulse text-lg">กำลังโหลดข้อมูล...</div>
    </div>
  )

  const s = stats || {}

  return (
    <div className="p-gutter pt-8 space-y-xl flex-1 pb-16">
      {/* Page Title */}
      <div>
        <h1 className="font-h1 text-h1 text-primary">ภาพรวมระบบ</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">ข้อมูลแบบเรียลไทม์ของแพลตฟอร์ม THLotto</p>
      </div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-on-surface-variant text-sm mt-0.5 flex items-center gap-1">
            <Clock size={13}/> อัพเดทล่าสุด: {lastUpdate.toLocaleTimeString('th-TH')}
          </p>
        </div>
        <button onClick={loadAll} className="flex items-center gap-2 px-4 py-2 glass-panel rounded-full text-sm text-on-surface-variant hover:bg-surface-container shadow-glass transition">
          <RefreshCw size={15}/> รีเฟรช
        </button>
      </div>

      {/* KPI */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-gutter">
        <KPICard icon={Users}          label="สมาชิกทั้งหมด"   value={fmt(s.total_members)}    sub={`ใหม่วันนี้ ${fmt(s.new_today)} คน`}        color="blue" />
        <KPICard icon={Wallet}         label="ยอดเงินรวมในระบบ" value={`฿${fmt(s.total_balance)}`} sub={`ฝากวันนี้ ฿${fmt(s.today_deposit)}`}   color="emerald" />
        <KPICard icon={ArrowDownCircle} label="รอ Approve ฝาก"  value={fmt(s.pending_deposits)}  sub="รายการรอดำเนินการ"                          color="amber" alert={s.pending_deposits > 0} />
        <KPICard icon={ArrowUpCircle}   label="รอ Approve ถอน"  value={fmt(s.pending_withdraws)} sub="รายการรอดำเนินการ"                          color="rose"  alert={s.pending_withdraws > 0} />
      </section>

      {/* Secondary KPI */}
      <section className="grid grid-cols-1 gap-md h-[400px]">
        <div className="bg-surface-container-lowest rounded-[32px] p-lg shadow-[0_15px_40px_rgba(6,78,59,0.05)] border border-white flex items-center justify-between hover:shadow-[0_20px_50px_rgba(6,78,59,0.1)] transition-shadow">
          <div>
            <p className="font-body-md text-body-md text-on-surface-variant">ยอดแทงวันนี้</p>
            <h3 className="font-h3 text-h3 text-on-surface">฿{fmt(s.today_bets)}</h3>
          </div>
          <div className="h-12 w-12 rounded-full bg-surface-container flex items-center justify-center text-primary">
            <ListOrdered size={24}/>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-[32px] p-lg shadow-[0_15px_40px_rgba(6,78,59,0.05)] border border-white flex items-center justify-between hover:shadow-[0_20px_50px_rgba(6,78,59,0.1)] transition-shadow">
          <div>
            <p className="font-body-md text-body-md text-on-surface-variant">จ่ายรางวัลทั้งหมด</p>
            <h3 className="font-h3 text-h3 text-on-surface">฿{fmt(s.today_payouts)}</h3>
          </div>
          <div className="h-12 w-12 rounded-full bg-surface-container flex items-center justify-center text-primary">
            <AlertTriangle size={24}/>
          </div>
        </div>
        <div className={`bg-primary rounded-[32px] p-lg shadow-lg border border-primary-container flex items-center justify-between text-on-primary transform hover:scale-[1.01] transition-transform`}>
          <div>
            <p className="font-body-md text-body-md text-primary-fixed-dim">กำไรสุทธิ</p>
            <h3 className="font-h3 text-h3">฿{fmt(s.today_bets - s.today_payouts)}</h3>
          </div>
          <div className="h-12 w-12 rounded-full bg-primary-container flex items-center justify-center text-primary-fixed">
            <TrendingUp size={24}/>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-[32px] p-lg shadow-[0_15px_40px_rgba(6,78,59,0.05)] border border-white flex items-center justify-between hover:shadow-[0_20px_50px_rgba(6,78,59,0.1)] transition-shadow">
          <div>
            <p className="font-body-md text-body-md text-on-surface-variant">ตลาดที่เปิดอยู่</p>
            <h3 className="font-h3 text-h3 text-on-surface">{markets.filter(m => m.is_open).length}</h3>
          </div>
          <div className="h-12 w-12 rounded-full bg-surface-container flex items-center justify-center text-primary">
            <ListOrdered size={24}/>
          </div>
        </div>
      </section>

      {/* Charts + Markets */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-gutter">
        {/* Bar Chart */}
        <div className="xl:col-span-2 bg-surface-container-lowest rounded-[32px] p-container-padding shadow-[0_15px_40px_rgba(6,78,59,0.05)] border border-white flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-h3 text-h3 text-on-surface font-semibold">วิเคราะห์รายได้ (7 วัน)</h3>
            <div className="flex gap-2">
              <button className="px-4 py-1.5 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm hover:bg-surface-container-high transition-colors">รายวัน</button>
              <button className="px-4 py-1.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm shadow-sm">รายสัปดาห์</button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chart} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [`฿${fmt(v)}`, '']} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="ฝาก"      fill="#10b981" radius={[4,4,0,0]} />
              <Bar dataKey="แทง"      fill="#3b82f6" radius={[4,4,0,0]} />
              <Bar dataKey="จ่ายรางวัล" fill="#f43f5e" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Market Status */}
        <div className="bg-surface-container-lowest rounded-[32px] p-container-padding shadow-[0_15px_40px_rgba(6,78,59,0.05)] border border-white flex flex-col h-[400px] overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-h3 text-h3 text-on-surface font-semibold">ตลาดที่เปิดรับ</h3>
            <button className="text-primary font-label-sm text-label-sm hover:underline">ดูทั้งหมด</button>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar pr-2">
            <div className="space-y-2">
              {markets.length === 0 && <div className="text-outline text-sm text-center py-4">ไม่มีตลาด</div>}
              {markets.map(m => (
                <div key={m.id} className="flex items-center justify-between p-4 rounded-[12px] bg-surface hover:bg-surface-container-highest transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary-container/10 flex items-center justify-center text-primary">
                      <ListOrdered size={20}/>
                    </div>
                    <div>
                      <p className="font-body-md text-body-md text-on-surface font-medium">{m.name}</p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">ออกรางวัล: {m.draw_date ? new Date(m.draw_date).toLocaleDateString('th-TH') : 'ทุกวัน'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full font-label-sm text-label-sm ${m.is_open ? 'bg-[#f0fdf4] text-secondary' : 'bg-surface-variant text-on-surface-variant'}`}>
                      {m.is_open ? 'กำลังเปิดรับแทง' : 'ปิดรับแทง'}
                    </span>
                    {m.countdown && <p className="font-body-md text-body-md text-primary mt-1 font-mono">{m.countdown}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feed */}
      <section className="bg-surface-container-lowest rounded-[32px] p-container-padding shadow-[0_15px_40px_rgba(6,78,59,0.05)] border border-white flex flex-col h-[500px] overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-h3 text-h3 text-on-surface font-semibold">รายการเรียลไทม์</h3>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
            </span>
            <span className="font-label-sm text-label-sm text-secondary">สด</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar pr-2">
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-surface-container-highest">
            {feed.map((f, i) => (
              <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-surface-container-lowest ${['DEPOSIT','BONUS'].includes(f.type) ? 'bg-[#f0fdf4] text-secondary' : f.type === 'WITHDRAW' ? 'bg-error-container text-on-error-container' : 'bg-surface-container text-primary'} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10`}>
                  <span className="text-[18px]">{feedIcon(f.type)}</span>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-surface p-4 rounded-[16px] shadow-sm border border-white/50">
                  <div className="flex justify-between mb-1">
                    <span className={`font-label-sm text-label-sm font-semibold ${['DEPOSIT','BONUS'].includes(f.type) ? 'text-secondary' : f.type === 'WITHDRAW' ? 'text-error' : 'text-primary'}`}>{f.type === 'DEPOSIT' ? 'ฝากเงิน' : f.type === 'WITHDRAW' ? 'ถอนเงิน' : f.type === 'BET' ? 'แทงหวย' : f.type}</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">{new Date(f.created_at).toLocaleString('th-TH')}</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface">
                    {f.profiles?.full_name || f.profiles?.member_id || 'ระบบ'} — {f.note || f.type}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
