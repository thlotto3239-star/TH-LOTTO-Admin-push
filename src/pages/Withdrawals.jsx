import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { CheckCircle, XCircle, Search, Loader2, Copy } from 'lucide-react'

const STATUS_LABEL = { PENDING: { label: 'รอดำเนินการ', cls: 'bg-amber-100 text-amber-700' }, APPROVED: { label: 'โอนแล้ว', cls: 'bg-emerald-100 text-emerald-700' }, REJECTED: { label: 'ปฏิเสธ', cls: 'bg-red-100 text-red-700' } }
const fmt = (n) => Number(n || 0).toLocaleString('th-TH')

export default function Withdrawals() {
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [status, setStatus]   = useState('PENDING')
  const [modal, setModal]     = useState(null)
  const [note, setNote]       = useState('')
  const [working, setWorking] = useState(false)
  const [copied, setCopied]   = useState('')

  const load = async () => {
    setLoading(true)
    let q = supabase.from('withdraw_requests')
      .select('id,amount,status,admin_note,bank_name,bank_account_number,bank_account_name,created_at,profiles(full_name,member_id,phone)')
      .order('created_at', { ascending: false })
    if (status !== 'ALL') q = q.eq('status', status)
    if (search) {
      const { data: matched } = await supabase.from('profiles').select('id')
        .or(`member_id.ilike.%${search}%,phone.ilike.%${search}%,full_name.ilike.%${search}%`)
      const ids = (matched || []).map(p => p.id)
      if (ids.length === 0) { setRows([]); setLoading(false); return }
      q = q.in('user_id', ids)
    }
    const { data } = await q
    setRows(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [status, search])

  useEffect(() => {
    const ch = supabase.channel('withdrawals-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'withdraw_requests' }, load)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

  const approve = async () => {
    setWorking(true)
    const { error } = await supabase.rpc('admin_approve_withdraw', { p_request_id: modal.id, p_note: note || null })
    setWorking(false)
    if (error) { alert('เกิดข้อผิดพลาด: ' + error.message); return }
    setModal(null); setNote(''); load()
  }

  const reject = async () => {
    if (!note) { alert('กรุณาระบุเหตุผลที่ปฏิเสธ'); return }
    setWorking(true)
    const { error } = await supabase.rpc('admin_reject_withdraw', { p_request_id: modal.id, p_note: note })
    setWorking(false)
    if (error) { alert('เกิดข้อผิดพลาด: ' + error.message); return }
    setModal(null); setNote(''); load()
  }

  const copyText = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">อนุมัติถอนเงิน</h1>
        <p className="text-on-surface-variant text-sm">โอนเงินให้ลูกค้าก่อน แล้วกด "อนุมัติ"</p>
      </div>

      <div className="glass-panel rounded-2xl shadow-glass p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาชื่อ/เบอร์/Member ID"
            className="w-full pl-9 pr-4 py-2 rounded-full bg-surface-container-low border-none text-sm focus:outline-none focus:ring-2 focus:ring-primary"/>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['PENDING','APPROVED','REJECTED','ALL'].map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${status === s ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>
              {s === 'ALL' ? 'ทั้งหมด' : STATUS_LABEL[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-panel rounded-2xl shadow-glass overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32"><Loader2 className="animate-spin text-emerald-500" size={24}/></div>
        ) : rows.length === 0 ? (
          <div className="text-center py-12 text-outline">ไม่มีรายการ</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-container text-on-surface-variant text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">สมาชิก</th>
                  <th className="px-4 py-3 font-medium">ยอด</th>
                  <th className="px-4 py-3 font-medium">บัญชีปลายทาง</th>
                  <th className="px-4 py-3 font-medium">สถานะ</th>
                  <th className="px-4 py-3 font-medium">วันที่</th>
                  <th className="px-4 py-3 font-medium">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.map(r => (
                  <tr key={r.id} className="hover:bg-surface-container-low transition">
                    <td className="px-4 py-3">
                      <div className="font-medium text-on-surface">{r.profiles?.full_name || '-'}</div>
                      <div className="text-xs text-on-surface-variant">{r.profiles?.member_id} · {r.profiles?.phone}</div>
                    </td>
                    <td className="px-4 py-3 font-bold text-error">฿{fmt(r.amount)}</td>
                    <td className="px-4 py-3">
                      <div className="text-xs">
                        <div className="font-medium text-on-surface">{r.bank_name}</div>
                        <div className="flex items-center gap-1 text-slate-500">
                          {r.bank_account_number}
                          <button onClick={() => copyText(r.bank_account_number)} className="text-blue-500 hover:text-blue-700">
                            {copied === r.bank_account_number ? '✓' : <Copy size={11}/>}
                          </button>
                        </div>
                        <div className="text-on-surface-variant">{r.bank_account_name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_LABEL[r.status]?.cls}`}>
                        {STATUS_LABEL[r.status]?.label || r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-on-surface-variant">{new Date(r.created_at).toLocaleString('th-TH')}</td>
                    <td className="px-4 py-3">
                      {r.status === 'PENDING' && (
                        <button onClick={() => { setModal(r); setNote('') }}
                          className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-on-primary rounded-full text-xs font-medium transition">
                          ดำเนินการ
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl shadow-capsule w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-on-surface mb-4">ดำเนินการรายการถอน</h3>
            <div className="bg-surface-container-low rounded-xl p-4 mb-4 space-y-2 text-sm">
              <div className="font-semibold text-primary mb-2">⚠️ โอนเงินให้ลูกค้าก่อน แล้วค่อยกดอนุมัติ</div>
              <div><span className="text-on-surface-variant">สมาชิก:</span> <span className="font-semibold text-on-surface">{modal.profiles?.full_name}</span></div>
              <div><span className="text-on-surface-variant">ยอดถอน:</span> <span className="font-bold text-error">฿{fmt(modal.amount)}</span></div>
              <div className="border-t border-outline-variant pt-2">
                <div className="text-outline text-xs mb-1">โอนไปที่:</div>
                <div className="font-semibold text-on-surface">{modal.bank_name}</div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-on-surface">{modal.bank_account_number}</span>
                  <button onClick={() => copyText(modal.bank_account_number)}
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                    <Copy size={12}/> {copied === modal.bank_account_number ? 'คัดลอกแล้ว!' : 'คัดลอก'}
                  </button>
                </div>
                <div className="text-on-surface-variant">{modal.bank_account_name}</div>
              </div>
            </div>
            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder="หมายเหตุ (ถ้ามี)"
              className="w-full bg-surface-container-low border-none rounded-xl px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-primary resize-none h-20"/>
            <div className="flex gap-3">
              <button onClick={approve} disabled={working}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-full font-semibold text-sm transition disabled:opacity-60">
                {working ? <Loader2 size={16} className="animate-spin"/> : <CheckCircle size={16}/>} โอนแล้ว / อนุมัติ
              </button>
              <button onClick={reject} disabled={working}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-error hover:bg-error/90 text-on-error rounded-full font-semibold text-sm transition disabled:opacity-60">
                {working ? <Loader2 size={16} className="animate-spin"/> : <XCircle size={16}/>} ปฏิเสธ
              </button>
              <button onClick={() => setModal(null)} className="px-4 py-2.5 bg-surface-container hover:bg-surface-container-high rounded-full text-sm text-on-surface-variant transition">ยกเลิก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
