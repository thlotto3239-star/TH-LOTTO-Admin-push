import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import {
  TrendingUp, Wallet, Users, Clock, Activity, Zap, RefreshCw
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const fmt = (n) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 0 })

function KPICard({ icon: Icon, label, value, sub, color = 'emerald' }) {
  const colors = {
    emerald: 'bg-primary-container text-on-primary-container',
    blue:    'bg-secondary-container text-on-secondary-container',
    amber:   'bg-warning-container text-on-warning-container',
    rose:    'bg-error-container text-on-error-container',
  }
  return (
    <div className="glass-panel rounded-2xl p-5 shadow-glass">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${colors[color]}`}>
          <Icon size={20}/>
        </div>
      </div>
      <div className="text-2xl font-bold text-on-surface">{value}</div>
      <div className="text-sm text-on-surface-variant mt-0.5">{label}</div>
      {sub && <div className="text-xs text-outline mt-1">{sub}</div>}
    </div>
  )
}

export default function InstantOverview() {
  const [stats, setStats] = useState(null)
  const [recentDraws, setRecentDraws] = useState([])
  const [recentBets, setRecentBets] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      
      const [statsRes, drawsRes, betsRes] = await Promise.all([
        supabase.rpc('admin_get_instant_stats'),
        supabase.rpc('admin_get_instant_draws', { p_limit: 10 }),
        supabase.rpc('admin_get_instant_bets', { p_limit: 10 })
      ])

      if (statsRes.data) {
        setStats(statsRes.data[0] || {})
      }
      
      if (drawsRes.data) {
        setRecentDraws(drawsRes.data || [])
      }
      
      if (betsRes.data) {
        setRecentBets(betsRes.data || [])
      }
      
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error loading instant overview:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [loadData])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">ภาพรวมหวยหนึ่งนาที</h1>
          <p className="text-sm text-on-surface-variant mt-1">ข้อมูลสรุปและสถิติระบบหวยหนึ่งนาที</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary-hover transition"
        >
          <RefreshCw size={16} />
          รีเฟรช
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={Activity}
          label="งวดออกรางวัลทั้งหมด"
          value={fmt(stats?.total_draws || 0)}
          sub="ตั้งแต่เริ่มระบบ"
          color="emerald"
        />
        <KPICard
          icon={Users}
          label="รายการแทงทั้งหมด"
          value={fmt(stats?.total_bets || 0)}
          sub="ทั้งหมด"
          color="blue"
        />
        <KPICard
          icon={Wallet}
          label="ยอดเดิมพันรวม"
          value={fmt(stats?.total_wagers || 0)}
          sub="บาท"
          color="amber"
        />
        <KPICard
          icon={TrendingUp}
          label="ยอดจ่ายรางวัล"
          value={fmt(stats?.total_payouts || 0)}
          sub="บาท"
          color="rose"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          icon={Zap}
          label="ประเภทเดิมพันที่เปิด"
          value={stats?.active_bet_types || 0}
          sub="จากทั้งหมด"
          color="emerald"
        />
        <KPICard
          icon={Wallet}
          label="ยอดเดิมพันเฉลี่ย"
          value={fmt(stats?.avg_bet_amount || 0)}
          sub="บาท/ครั้ง"
          color="blue"
        />
        <KPICard
          icon={Clock}
          label="อัตราชนะ"
          value={stats?.win_rate ? stats.win_rate.toFixed(2) : '0'}
          sub="%"
          color="amber"
        />
      </div>

      {/* Recent Draws */}
      <div className="glass-panel rounded-2xl p-6 shadow-glass">
        <h2 className="text-lg font-semibold text-on-surface mb-4">งวดออกรางวัลล่าสุด</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline">
                <th className="text-left py-2 px-3 text-sm font-medium text-on-surface-variant">งวด</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-on-surface-variant">ผลรางวัล</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-on-surface-variant">สถานะ</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-on-surface-variant">รายการแทง</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-on-surface-variant">ยอดเดิมพัน</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-on-surface-variant">ยอดจ่าย</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-on-surface-variant">เวลา</th>
              </tr>
            </thead>
            <tbody>
              {recentDraws.map((draw) => (
                <tr key={draw.id} className="border-b border-outline hover:bg-surface-variant">
                  <td className="py-2 px-3 text-sm text-on-surface">{draw.draw_id}</td>
                  <td className="py-2 px-3 text-sm font-mono text-on-surface">{draw.result_6d || '-'}</td>
                  <td className="py-2 px-3 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      draw.status === 'settled' ? 'bg-primary-container text-on-primary-container' :
                      draw.status === 'pending' ? 'bg-warning-container text-on-warning-container' :
                      'bg-error-container text-on-error-container'
                    }`}>
                      {draw.status === 'settled' ? 'จ่ายแล้ว' :
                       draw.status === 'pending' ? 'รอจ่าย' : draw.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-sm text-on-surface">{fmt(draw.total_bets)}</td>
                  <td className="py-2 px-3 text-sm text-on-surface">{fmt(draw.total_wagers)}</td>
                  <td className="py-2 px-3 text-sm text-on-surface">{fmt(draw.total_payouts)}</td>
                  <td className="py-2 px-3 text-sm text-on-surface-variant">
                    {new Date(draw.created_at).toLocaleString('th-TH')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Bets */}
      <div className="glass-panel rounded-2xl p-6 shadow-glass">
        <h2 className="text-lg font-semibold text-on-surface mb-4">รายการแทงล่าสุด</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline">
                <th className="text-left py-2 px-3 text-sm font-medium text-on-surface-variant">เบอร์โทรศัพท์</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-on-surface-variant">งวด</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-on-surface-variant">ประเภท</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-on-surface-variant">เลข</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-on-surface-variant">ยอดเดิมพัน</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-on-surface-variant">ยอดจ่าย</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-on-surface-variant">สถานะ</th>
                <th className="text-left py-2 px-3 text-sm font-medium text-on-surface-variant">เวลา</th>
              </tr>
            </thead>
            <tbody>
              {recentBets.map((bet) => (
                <tr key={bet.id} className="border-b border-outline hover:bg-surface-variant">
                  <td className="py-2 px-3 text-sm text-on-surface">{bet.phone}</td>
                  <td className="py-2 px-3 text-sm text-on-surface">{bet.draw_id}</td>
                  <td className="py-2 px-3 text-sm text-on-surface">{bet.bet_type}</td>
                  <td className="py-2 px-3 text-sm font-mono text-on-surface">{bet.numbers}</td>
                  <td className="py-2 px-3 text-sm text-on-surface">{fmt(bet.amount)}</td>
                  <td className="py-2 px-3 text-sm text-on-surface">{fmt(bet.winnings)}</td>
                  <td className="py-2 px-3 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      bet.is_win ? 'bg-primary-container text-on-primary-container' :
                      bet.status === 'pending' ? 'bg-warning-container text-on-warning-container' :
                      'bg-error-container text-on-error-container'
                    }`}>
                      {bet.is_win ? 'ชนะ' :
                       bet.status === 'pending' ? 'รอผล' : bet.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-sm text-on-surface-variant">
                    {new Date(bet.created_at).toLocaleString('th-TH')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-xs text-on-surface-variant text-right">
        อัพเดทล่าสุด: {lastUpdate.toLocaleString('th-TH')}
      </div>
    </div>
  )
}
