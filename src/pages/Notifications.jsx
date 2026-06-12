import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import { alert } from '../utils/alert'
import { Loader2, Send, Bell } from 'lucide-react'

export default function Notifications() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [lastResult, setLastResult] = useState(null)

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) { alert.error('กรุณากรอกหัวข้อและรายละเอียด'); return }
    setSending(true)
    try {
      const { data, error } = await supabase.rpc('admin_broadcast_notification', {
        p_title: title.trim(),
        p_body: body.trim()
      })
      if (error) throw error
      setLastResult(data)
      alert.success(`ส่งแจ้งเตือนถึง ${data.sent_to} คนสำเร็จ`)
      setTitle('')
      setBody('')
    } catch (err) {
      alert.error('ส่งไม่สำเร็จ: ' + err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Bell className="text-primary" size={20} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-800">แจ้งเตือน Broadcast</h1>
          <p className="text-xs text-slate-400">ส่งข้อความแจ้งเตือนถึงผู้ใช้ทุกคน</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase">หัวข้อ</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="เช่น โปรโมชั่นใหม่!"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase">รายละเอียด</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="รายละเอียดแจ้งเตือน..."
            rows={4}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>
        <button
          onClick={handleSend}
          disabled={sending || !title.trim() || !body.trim()}
          className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 disabled:bg-slate-300 text-white text-sm font-bold rounded-xl transition-colors"
        >
          {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
          {sending ? 'กำลังส่ง...' : 'ส่งแจ้งเตือนทุกคน'}
        </button>
      </div>

      {lastResult && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-sm text-green-700">
          ✅ ส่งสำเร็จ — แจ้งเตือนถึง <strong>{lastResult.sent_to}</strong> คน
        </div>
      )}
    </div>
  )
}
