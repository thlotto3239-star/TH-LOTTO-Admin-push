import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Search, Loader2 } from 'lucide-react'

const STATUS = { PENDING:'bg-warning-container text-on-warning-container', WON:'bg-secondary-container text-on-secondary-container', LOST:'bg-surface-container text-on-surface-variant', CANCELLED:'bg-error-container text-on-error-container' }
const STATUS_LABELS = { PENDING:'รอผล', WON:'ถูกรางวัล', LOST:'ไม่ถูก', CANCELLED:'ยกเลิก' }
const fmt = (n) => Number(n || 0).toLocaleString('th-TH')

const BET_TYPE_LABELS = {
  '3TOP': '3 ตัวบน', '3DOWN': '3 ตัวล่าง', '3TOD': '3 ตัวโต๊ด', '3TODE': '3 ตัวโต๊ด',
  '3FRONT': '3 ตัวหน้า', '3BOTTOM': '3 ตัวล่าง',
  '2TOP': '2 ตัวบน', '2DOWN': '2 ตัวล่าง', '2BOTTOM': '2 ตัวล่าง', '2TOD': '2 ตัวโต๊ด',
  '1TOP': 'วิ่งบน', '1DOWN': 'วิ่งล่าง', 'RUNNING': 'วิ่ง', 'RUN_UP': 'วิ่งบน', 'RUN_DOWN': 'วิ่งล่าง',
  '3COMBO': '3 ตัวคู่', '4COMBO': '4 ตัวคู่', '4TOP': '4 ตัวบน',
}

export default function BetsList() {
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [status, setStatus]   = useState('ALL')
  const [page, setPage]       = useState(0)
  const LIMIT = 30

  const load = async () => {
    setLoading(true)
    let q = supabase.from('bets')
      .select('id,numbers,bet_type,amount,payout_rate,payout_amount,status,draw_date,created_at,profiles(full_name,member_id),lottery_markets(name)')
      .order('created_at', { ascending: false })
      .range(page * LIMIT, (page + 1) * LIMIT - 1)
    if (status !== 'ALL') q = q.eq('status', status)
    if (search) {
      const { data: matched } = await supabase.from('profiles').select('id')
        .or(`member_id.ilike.%${search}%,full_name.ilike.%${search}%`)
      const ids = (matched || []).map(p => p.id)
      if (ids.length > 0) {
        q = q.or(`numbers.ilike.%${search}%,user_id.in.(${ids.join(',')})`)
      } else {
        q = q.ilike('numbers', `%${search}%`)
      }
    }
    const { data } = await q
    setRows(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [status, search, page])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">รายการโพยหวย</h1>
        <p className="text-on-surface-variant text-sm">ดูรายการแทงทั้งหมด</p>
      </div>

      <div className="glass-panel rounded-2xl shadow-glass p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"/>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} placeholder="ค้นหาชื่อ/Member ID/เลข"
            className="w-full pl-9 pr-4 py-2 rounded-full bg-surface-container-low border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary"/>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['ALL','PENDING','WON','LOST'].map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(0) }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${status === s ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>
              {s === 'ALL' ? 'ทั้งหมด' : s === 'PENDING' ? 'รอผล' : s === 'WON' ? 'ถูก' : 'ไม่ถูก'}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-panel rounded-2xl shadow-glass overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32"><Loader2 className="animate-spin text-primary" size={24}/></div>
        ) : rows.length === 0 ? (
          <div className="text-center py-12 text-outline">ไม่มีรายการ</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-container text-left">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">สมาชิก</th>
                  <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">ตลาด</th>
                  <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">เลข</th>
                  <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">ประเภท</th>
                  <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap text-right">ยอด</th>
                  <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap text-right">จ่าย</th>
                  <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">สถานะ</th>
                  <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">งวด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {rows.map(r => (
                  <tr key={r.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-on-surface text-sm">{r.profiles?.full_name || '-'}</div>
                      <div className="text-xs text-outline">{r.profiles?.member_id}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant whitespace-nowrap">{r.lottery_markets?.name || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <code className="font-mono font-bold text-on-surface bg-surface-container px-2 py-0.5 rounded text-sm">{r.numbers}</code>
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant whitespace-nowrap font-medium">{BET_TYPE_LABELS[r.bet_type] || r.bet_type}</td>
                    <td className="px-4 py-3 font-semibold text-on-surface text-right whitespace-nowrap text-sm">฿{fmt(r.amount)}</td>
                    <td className="px-4 py-3 font-semibold text-secondary text-right whitespace-nowrap text-sm">{r.payout_amount > 0 ? `฿${fmt(r.payout_amount)}` : '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STATUS[r.status] || 'bg-surface-container text-on-surface-variant'}`}>
                        {STATUS_LABELS[r.status] || r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-on-surface-variant whitespace-nowrap">{r.draw_date || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant text-sm text-on-surface-variant">
          <span>หน้า {page + 1}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(0, p-1))} disabled={page === 0}
              className="px-3 py-1 rounded-full bg-surface-container hover:bg-surface-container-high disabled:opacity-40">ก่อนหน้า</button>
            <button onClick={() => setPage(p => p+1)} disabled={rows.length < LIMIT}
              className="px-3 py-1 rounded-full bg-surface-container hover:bg-surface-container-high disabled:opacity-40">ถัดไป</button>
          </div>
        </div>
      </div>
    </div>
  )
}
