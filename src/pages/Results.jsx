import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Loader2, CheckCircle2, RefreshCw, Clock, Lock } from 'lucide-react'

const fmtDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('th-TH', { day:'numeric', month:'short', year:'numeric' })
const fmtDt   = (d) => new Date(d).toLocaleString('th-TH', { dateStyle:'short', timeStyle:'short' })

export default function Results() {
  const [schedules, setSchedules] = useState([])
  const [resultMap, setResultMap] = useState({})
  const [recent,    setRecent]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [tab,       setTab]       = useState('pending')

  const load = async () => {
    setLoading(true)
    // วันนี้ (Bangkok time)
    const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' })).toISOString().slice(0, 10)
    const [{ data: sched }, { data: res }] = await Promise.all([
      // รอออกผล: เฉพาะวันนี้
      supabase
        .from('draw_schedules')
        .select('id, market_id, draw_date, close_time, status, lottery_markets(id,name,code,type)')
        .eq('draw_date', today)
        .order('close_time')
        .limit(50),
      // ผลล่าสุด: วันนี้ + 3 วันย้อนหลัง
      supabase
        .from('lottery_results')
        .select('id, market_id, draw_date, result_main, result_3top, result_2top, result_2bottom, result_3front, result_3bottom, announced_at, status, lottery_markets(name,code)')
        .gte('draw_date', new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10))
        .order('draw_date', { ascending: false })
        .order('announced_at', { ascending: false })
        .limit(50),
    ])
    const map = {}
    res?.forEach(r => { map[`${r.market_id}_${r.draw_date}`] = r })
    setResultMap(map)
    setSchedules(sched || [])
    setRecent(res || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">ผลรางวัล</h1>
          <p className="text-on-surface-variant text-sm">ระบบออกผลและชำระรางวัลอัตโนมัติ (ดูอย่างเดียว)</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface-variant rounded-full text-sm transition">
          <RefreshCw size={14}/> รีเฟรช
        </button>
      </div>

      {/* Auto-mode notice */}
      <div className="glass-panel rounded-2xl px-4 py-3 flex items-start gap-2.5 text-sm">
        <Lock size={16} className="flex-shrink-0 mt-0.5 text-primary"/>
        <span className="text-on-surface-variant">
          ผลรางวัลถูกออกและชำระเงินโดยระบบอัตโนมัติ — หน้านี้ใช้สำหรับตรวจสอบสถานะและผลย้อนหลังเท่านั้น ผู้ดูแลระบบไม่สามารถกรอกหรือแก้ไขผลได้
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[['pending','รอออกผล'],['recent','ผลล่าสุด']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition ${tab === k ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center h-32 items-center"><Loader2 className="animate-spin text-primary" size={24}/></div>
      ) : tab === 'pending' ? (
        <div className="glass-panel rounded-2xl shadow-glass overflow-hidden">
          {schedules.length === 0 ? (
            <div className="text-center py-12 text-outline">ไม่มีงวดที่รอออกผล</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-container text-left">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">ตลาด</th>
                    <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">งวดวันที่</th>
                    <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">ปิดรับแทง</th>
                    <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {schedules.map(s => {
                    const hasResult = !!resultMap[`${s.market_id}_${s.draw_date}`]
                    return (
                      <tr key={s.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-medium text-on-surface text-sm">{s.lottery_markets?.name}</div>
                          <div className="text-xs text-outline font-mono">{s.lottery_markets?.code}</div>
                        </td>
                        <td className="px-4 py-3 text-on-surface text-sm whitespace-nowrap">{fmtDate(s.draw_date)}</td>
                        <td className="px-4 py-3 text-xs text-on-surface-variant whitespace-nowrap">{fmtDt(s.close_time)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {hasResult ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-container text-on-primary-container">
                              <CheckCircle2 size={12}/> ออกผลแล้ว
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-warning-container text-on-warning-container">
                              <Clock size={12}/> รอระบบออกผล
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl shadow-glass overflow-hidden">
          {recent.length === 0 ? (
            <div className="text-center py-12 text-outline">ยังไม่มีผลรางวัล</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-container text-left">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">ตลาด</th>
                    <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">งวดวันที่</th>
                    <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">เลขหลัก</th>
                    <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">3 ตัวบน</th>
                    <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">2 ตัวบน</th>
                    <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">2 ตัวล่าง</th>
                    <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">ประกาศเมื่อ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {recent.map(r => (
                    <tr key={r.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium text-on-surface text-sm">{r.lottery_markets?.name}</div>
                        <div className="text-xs text-outline font-mono">{r.lottery_markets?.code}</div>
                      </td>
                      <td className="px-4 py-3 text-on-surface text-sm whitespace-nowrap">{fmtDate(r.draw_date)}</td>
                      <td className="px-4 py-3 whitespace-nowrap"><code className="font-mono font-bold text-base tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{r.result_main || '-'}</code></td>
                      <td className="px-4 py-3 font-bold text-primary font-mono text-base whitespace-nowrap">{r.result_3top || '-'}</td>
                      <td className="px-4 py-3 font-mono text-on-surface whitespace-nowrap">{r.result_2top || '-'}</td>
                      <td className="px-4 py-3 font-mono text-on-surface whitespace-nowrap">{r.result_2bottom || '-'}</td>
                      <td className="px-4 py-3 text-xs text-on-surface-variant whitespace-nowrap">{r.announced_at ? fmtDt(r.announced_at) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
