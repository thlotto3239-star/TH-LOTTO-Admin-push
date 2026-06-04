import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import { Settings, Save, RefreshCw, Clock, Zap, Shield, Bell, Upload, Loader2, Image } from 'lucide-react'
import { alert } from '../utils/alert'
import { toast } from '../components/Toast'

function Toggle({ checked, onChange, danger = false }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${checked ? (danger ? 'bg-red-600' : 'bg-[#064e3b]') : 'bg-slate-200'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow border border-slate-200 transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`} />
    </button>
  )
}

function Card({ icon: Icon, iconColor = 'text-emerald-800', title, children }) {
  return (
    <div className="rounded-3xl p-6" style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.35)', boxShadow: '0 4px 16px -4px rgba(6,78,59,0.07)' }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
          <Icon size={20} className={iconColor} />
        </div>
        <h2 className="text-base font-bold text-[#022c22]">{title}</h2>
      </div>
      {children}
    </div>
  )
}

export default function InstantSettings() {
  const [settings, setSettings] = useState({
    draw_interval: 60,
    auto_settle: true,
    max_bets_per_minute: 100,
    maintenance_mode: false,
    notification_enabled: true,
    log_retention_days: 30,
    instant_name: 'หวย 1 นาที',
    instant_logo_url: '',
    instant_show_popular: false,
    instant_show_trending: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const loadSettings = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .in('key', [
        'instant_draw_interval', 'instant_auto_settle', 'instant_max_bets_per_minute',
        'instant_maintenance_mode', 'instant_notification_enabled', 'instant_log_retention_days',
        'instant_name', 'instant_logo_url', 'instant_show_popular', 'instant_show_trending'
      ])
    if (error) { toast.error('โหลดข้อมูลล้มเหลว'); setLoading(false); return }
    const m = {}
    data.forEach(s => { m[s.key] = s.value })
    setSettings({
      draw_interval: parseInt(m.instant_draw_interval) || 60,
      auto_settle: m.instant_auto_settle !== 'false',
      max_bets_per_minute: parseInt(m.instant_max_bets_per_minute) || 100,
      maintenance_mode: m.instant_maintenance_mode === 'true',
      notification_enabled: m.instant_notification_enabled !== 'false',
      log_retention_days: parseInt(m.instant_log_retention_days) || 30,
      instant_name: m.instant_name || 'หวย 1 นาที',
      instant_logo_url: m.instant_logo_url || '',
      instant_show_popular: m.instant_show_popular === 'true',
      instant_show_trending: m.instant_show_trending !== 'false',
    })
    setLoading(false)
  }, [])

  useEffect(() => { loadSettings() }, [loadSettings])

  const set = (key, val) => setSettings(p => ({ ...p, [key]: val }))

  const handleSave = async () => {
    setSaving(true)
    const updates = [
      { key: 'instant_draw_interval', value: settings.draw_interval.toString() },
      { key: 'instant_auto_settle', value: settings.auto_settle.toString() },
      { key: 'instant_max_bets_per_minute', value: settings.max_bets_per_minute.toString() },
      { key: 'instant_maintenance_mode', value: settings.maintenance_mode.toString() },
      { key: 'instant_notification_enabled', value: settings.notification_enabled.toString() },
      { key: 'instant_log_retention_days', value: settings.log_retention_days.toString() },
      { key: 'instant_name', value: settings.instant_name },
      { key: 'instant_logo_url', value: settings.instant_logo_url },
      { key: 'instant_show_popular', value: settings.instant_show_popular.toString() },
      { key: 'instant_show_trending', value: settings.instant_show_trending.toString() },
    ]
    let hasError = false
    for (const u of updates) {
      const { error } = await supabase.rpc('admin_upsert_setting', { p_key: u.key, p_value: u.value })
      if (error) { hasError = true; break }
    }
    setSaving(false)
    if (hasError) {
      alert.error('บันทึกไม่สำเร็จ', 'กรุณาลองใหม่อีกครั้ง')
    } else {
      alert.success('บันทึกเรียบร้อย', 'ตั้งค่าระบบหวย 1 นาทีอัปเดตแล้ว')
    }
  }

  const handleLogoUpload = async (file) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('ขนาดไฟล์ต้องไม่เกิน 5MB'); return }
    setUploading(true)
    const ext = file.name.split('.').pop()
    const fileName = `instant/logo_${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('sliders').upload(fileName, file, { upsert: true })
    if (error) { toast.error('อัปโหลดล้มเหลว: ' + error.message); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('sliders').getPublicUrl(fileName)
    set('instant_logo_url', publicUrl)
    toast.success('อัปโหลดสำเร็จ')
    setUploading(false)
  }

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="animate-spin text-emerald-800" size={32} />
    </div>
  )

  return (
    <div className="space-y-8 pb-12" style={{ fontFamily: 'Prompt, sans-serif' }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[#022c22]">ตั้งค่าหวย 1 นาที</h1>
          <p className="text-slate-500 mt-2 text-base">จัดการการแสดงผล โลโก้ และการทำงานอัตโนมัติ</p>
        </div>
        <div className="flex gap-3">
          <button onClick={loadSettings} className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-600 rounded-full font-medium hover:bg-slate-50 transition">
            <RefreshCw size={16} /> รีเฟรช
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-3 bg-[#064e3b] hover:bg-[#043d2e] text-white px-8 py-3 rounded-full font-bold shadow-xl shadow-emerald-900/20 transition-all active:scale-95 disabled:opacity-50">
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            บันทึก
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ── Branding Card ── */}
        <div className="md:col-span-2 rounded-3xl p-6" style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.35)', boxShadow: '0 4px 16px -4px rgba(6,78,59,0.07)' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <Image size={20} className="text-emerald-800" />
            </div>
            <h2 className="text-base font-bold text-[#022c22]">แบรนดิ้งหวย 1 นาที</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Logo Upload */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
                {settings.instant_logo_url
                  ? <img src={settings.instant_logo_url} alt="logo" className="w-full h-full object-cover" />
                  : <span className="text-3xl">🎲</span>
                }
              </div>
              <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-sm font-medium hover:bg-emerald-100 transition">
                <input type="file" className="hidden" accept="image/*" onChange={e => handleLogoUpload(e.target.files[0])} disabled={uploading} />
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {uploading ? 'กำลังอัปโหลด...' : 'เปลี่ยนโลโก้'}
              </label>
            </div>

            {/* Name */}
            <div className="flex flex-col gap-2 sm:col-span-2">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ชื่อหวย 1 นาที</label>
                <input
                  type="text"
                  value={settings.instant_name}
                  onChange={e => set('instant_name', e.target.value)}
                  placeholder="เช่น หวย 1 นาที"
                  className="w-full px-4 py-3.5 bg-slate-100/70 border-2 border-transparent focus:border-emerald-800 rounded-2xl outline-none text-emerald-950 transition-all"
                />
              </div>
              {/* Show in Popular / Trending */}
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                  <div>
                    <p className="font-bold text-emerald-950 text-sm">แสดงในหมวดยอดนิยม</p>
                    <p className="text-xs text-slate-400">แสดงหวย 1 นาทีในส่วน Popular ของหน้าแรก</p>
                  </div>
                  <Toggle checked={settings.instant_show_popular} onChange={() => set('instant_show_popular', !settings.instant_show_popular)} />
                </div>
                <div className="flex items-center justify-between p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                  <div>
                    <p className="font-bold text-emerald-950 text-sm">แสดงในหมวดมาแรง</p>
                    <p className="text-xs text-slate-400">แสดงหวย 1 นาทีในส่วน Trending ของหน้าแรก</p>
                  </div>
                  <Toggle checked={settings.instant_show_trending} onChange={() => set('instant_show_trending', !settings.instant_show_trending)} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Draw Interval ── */}
        <Card icon={Clock} title="ช่วงเวลาออกรางวัล">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ช่วงเวลา (วินาที)</label>
          <input type="number" min="30" max="300" step="10" value={settings.draw_interval}
            onChange={e => set('draw_interval', parseInt(e.target.value))}
            className="mt-2 w-full px-4 py-3.5 bg-slate-100/70 border-2 border-transparent focus:border-emerald-800 rounded-2xl outline-none text-emerald-950 transition-all" />
          <p className="text-xs text-slate-400 mt-2">ระบบจะออกรางวัลทุก {settings.draw_interval} วินาที</p>
        </Card>

        {/* ── Auto Settle ── */}
        <Card icon={Zap} title="คำนวณผลอัตโนมัติ">
          <div className="flex items-center justify-between p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
            <div>
              <p className="font-bold text-emerald-950 text-sm">เปิดคำนวณผลอัตโนมัติ</p>
              <p className="text-xs text-slate-400 mt-0.5">คำนวณและจ่ายรางวัลทันทีหลังออกผล</p>
            </div>
            <Toggle checked={settings.auto_settle} onChange={() => set('auto_settle', !settings.auto_settle)} />
          </div>
        </Card>

        {/* ── Max Bets ── */}
        <Card icon={Shield} title="ข้อจำกัดการแทง">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">รายการแทงสูงสุดต่อนาที</label>
          <input type="number" min="10" max="1000" step="10" value={settings.max_bets_per_minute}
            onChange={e => set('max_bets_per_minute', parseInt(e.target.value))}
            className="mt-2 w-full px-4 py-3.5 bg-slate-100/70 border-2 border-transparent focus:border-emerald-800 rounded-2xl outline-none text-emerald-950 transition-all" />
          <p className="text-xs text-slate-400 mt-2">ป้องกันการโจมตีด้วยการแทงจำนวนมาก</p>
        </Card>

        {/* ── Maintenance Mode ── */}
        <Card icon={Settings} iconColor="text-red-600" title="โหมดบำรุงรักษา">
          <div className="flex items-center justify-between p-4 bg-red-50/60 rounded-2xl border border-red-100">
            <div>
              <p className="font-bold text-red-900 text-sm">เปิดโหมดบำรุงรักษา</p>
              <p className="text-xs text-slate-400 mt-0.5">ปิดระบบหวย 1 นาทีชั่วคราว</p>
            </div>
            <Toggle checked={settings.maintenance_mode} onChange={() => set('maintenance_mode', !settings.maintenance_mode)} danger />
          </div>
          {settings.maintenance_mode && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm">
              ⚠️ ระบบหวย 1 นาทีถูกปิดอยู่ ผู้ใช้แทงไม่ได้
            </div>
          )}
        </Card>

        {/* ── Notifications ── */}
        <Card icon={Bell} title="การแจ้งเตือน">
          <div className="flex items-center justify-between p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
            <div>
              <p className="font-bold text-emerald-950 text-sm">เปิดการแจ้งเตือน</p>
              <p className="text-xs text-slate-400 mt-0.5">แจ้งเตือนแอดมินเมื่อมีเหตุการณ์สำคัญ</p>
            </div>
            <Toggle checked={settings.notification_enabled} onChange={() => set('notification_enabled', !settings.notification_enabled)} />
          </div>
        </Card>

        {/* ── Log Retention ── */}
        <Card icon={Settings} title="การเก็บข้อมูล">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">เก็บข้อมูลนาน (วัน)</label>
          <input type="number" min="7" max="365" value={settings.log_retention_days}
            onChange={e => set('log_retention_days', parseInt(e.target.value))}
            className="mt-2 w-full px-4 py-3.5 bg-slate-100/70 border-2 border-transparent focus:border-emerald-800 rounded-2xl outline-none text-emerald-950 transition-all" />
          <p className="text-xs text-slate-400 mt-2">ลบข้อมูลที่เก่ากว่า {settings.log_retention_days} วันโดยอัตโนมัติ</p>
        </Card>

      </div>
    </div>
  )
}
