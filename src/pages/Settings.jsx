import React, { useEffect, useState, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { Loader2 } from 'lucide-react'
import { alert } from '../utils/alert'
import BankSelector from '../components/BankSelector'
import { useAuth } from '../AuthContext'

// ─── Modal Backdrop ───────────────────────────────────────────────────────────
function Modal({ open, onClose, title, icon, children, footer }) {
  const ref = useRef()
  useEffect(() => {
    if (open) ref.current?.showModal?.()
    else ref.current?.close?.()
  }, [open])
  return (
    <dialog
      ref={ref}
      onClick={e => { if (e.target === ref.current) onClose() }}
      className="w-full max-w-2xl rounded-[32px] p-0 overflow-hidden shadow-2xl border-none backdrop:bg-emerald-950/50 backdrop:backdrop-blur-sm"
      style={{ margin: 'auto' }}
    >
      <div className="bg-white font-['Prompt']">
        {/* Modal Header */}
        <div className="bg-[#022c22] p-7 flex justify-between items-center text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-800/60 flex items-center justify-center text-2xl shrink-0">
              {icon}
            </div>
            <h3 className="text-xl font-bold">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="max-h-[70vh] overflow-y-auto">
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="bg-slate-50/60 px-8 py-5 flex justify-end items-center gap-3 border-t border-slate-100">
            {footer}
          </div>
        )}
      </div>
    </dialog>
  )
}

// ─── Field Component ──────────────────────────────────────────────────────────
function Field({ label, hint, children }) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-slate-400 px-1 mt-1">{hint}</p>}
    </div>
  )
}

function NumberInput({ value, onChange, suffix }) {
  return (
    <div className="relative">
      <input
        type="number"
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-bold text-emerald-950 focus:ring-4 focus:ring-emerald-900/8 focus:border-emerald-900 transition-all outline-none pr-14"
      />
      {suffix && <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">{suffix}</span>}
    </div>
  )
}

function TextInput({ value, onChange, placeholder, large }) {
  return large ? (
    <textarea
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-medium text-slate-700 focus:ring-4 focus:ring-emerald-900/8 focus:border-emerald-900 transition-all outline-none resize-none min-h-[100px] leading-relaxed"
    />
  ) : (
    <input
      type="text"
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 font-medium text-slate-700 focus:ring-4 focus:ring-emerald-900/8 focus:border-emerald-900 transition-all outline-none"
    />
  )
}

function Toggle({ checked, onChange, label, sub }) {
  return (
    <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border-2 border-slate-100">
      <div>
        <p className="font-bold text-emerald-950">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-14 h-7 rounded-full transition-colors duration-200 shrink-0 ${checked ? 'bg-emerald-900' : 'bg-slate-300'}`}
      >
        <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-7' : ''}`}/>
      </button>
    </div>
  )
}

function SaveBtn({ onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="bg-emerald-900 text-white px-8 py-3.5 rounded-full font-bold shadow-lg hover:scale-[1.03] transition-all disabled:opacity-50 flex items-center gap-2"
    >
      {loading ? <Loader2 size={16} className="animate-spin"/> : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
      )}
      บันทึกข้อมูล
    </button>
  )
}

// ─── Hub Card ─────────────────────────────────────────────────────────────────
function HubCard({ icon, title, desc, tag, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group text-left w-full p-8 rounded-[32px] transition-all duration-500 flex flex-col items-start gap-5 hover:-translate-y-2 focus:outline-none"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(240,253,244,0.85) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.55)',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03), inset 0 1px 1px rgba(255,255,255,0.8)'
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(6,78,59,0.09), 0 10px 10px -5px rgba(6,78,59,0.05), inset 0 1px 2px rgba(255,255,255,1)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03), inset 0 1px 1px rgba(255,255,255,0.8)' }}
    >
      {/* Icon */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-500 shrink-0"
        style={{ background: 'linear-gradient(145deg, #ffffff, #f0fdf4)', boxShadow: '4px 4px 10px rgba(0,0,0,0.05), -2px -2px 10px rgba(255,255,255,0.8)' }}
      >
        {icon}
      </div>

      {/* Text */}
      <div className="space-y-2 flex-1">
        <h3 className="text-2xl font-bold text-emerald-950">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
      </div>

      {/* Footer */}
      <div className="pt-5 w-full border-t border-emerald-900/5 flex justify-between items-center">
        <span className="text-[10px] font-black text-emerald-800 uppercase tracking-[0.18em]">{tag}</span>
        <div className="w-8 h-8 rounded-full bg-emerald-900/5 flex items-center justify-center group-hover:bg-emerald-900 group-hover:text-white transition-all duration-300">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
        </div>
      </div>
    </button>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Settings() {
  const { profile } = useAuth()
  const [settings, setSettings] = useState({})
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [modal, setModal]       = useState(null) // 'financial' | 'bank' | 'wheel' | 'social' | 'announce' | 'system' | 'siteControl'

  // ── Marquee Announcements (CRUD จาก announcements table) ──
  const [announcements, setAnnouncements] = useState([])
  const [newAnnouncement, setNewAnnouncement] = useState('')
  const [uploading, setUploading] = useState(false)

  const isOwner = profile?.phone === '0622306037'
  const siteEnabled = settings.site_enabled !== undefined
    ? String(settings.site_enabled).toUpperCase() === 'TRUE'
    : true

  const loadAnnouncements = async () => {
    const { data } = await supabase.from('announcements').select('*').order('display_order', { ascending: true })
    setAnnouncements(data || [])
  }

  useEffect(() => {
    supabase.from('settings').select('key,value').then(({ data }) => {
      const map = {}
      data?.forEach(s => { map[s.key] = s.value })
      setSettings(map)
      setLoading(false)
    })
    loadAnnouncements()
  }, [])

  // Marquee CRUD
  const addAnnouncement = async () => {
    if (!newAnnouncement.trim()) return
    const maxOrder = Math.max(0, ...announcements.map(a => a.display_order || 0))
    const { error } = await supabase.from('announcements').insert({
      content: newAnnouncement.trim(),
      is_active: true,
      display_order: maxOrder + 1
    })
    if (error) { alert.error('เพิ่มไม่สำเร็จ', error.message); return }
    setNewAnnouncement('')
    loadAnnouncements()
  }

  const toggleAnnouncement = async (id, currentActive) => {
    const { error } = await supabase.from('announcements').update({ is_active: !currentActive }).eq('id', id)
    if (error) { alert.error('แก้ไขไม่สำเร็จ', error.message); return }
    loadAnnouncements()
  }

  const updateAnnouncementContent = async (id, content) => {
    const { error } = await supabase.from('announcements').update({ content }).eq('id', id)
    if (error) { alert.error('แก้ไขไม่สำเร็จ', error.message); return }
    loadAnnouncements()
  }

  const deleteAnnouncement = async (id) => {
    const ok = await alert.confirm('ลบข้อความนี้?', 'ไม่สามารถกู้คืนได้')
    if (!ok) return
    const { error } = await supabase.from('announcements').delete().eq('id', id)
    if (error) { alert.error('ลบไม่สำเร็จ', error.message); return }
    loadAnnouncements()
  }

  const set = (key, val) => setSettings(s => ({ ...s, [key]: val }))

  const saveGroup = async (keys) => {
    setSaving(true)
    try {
      const promises = keys.map(key =>
        supabase.rpc('admin_upsert_setting', { p_key: key, p_value: String(settings[key] ?? '') })
      )
      const results = await Promise.all(promises)
      const errors = results.filter(r => r.error).map(r => r.error.message)
      if (errors.length) { alert.error('เกิดข้อผิดพลาด', errors[0]); return }
      alert.success('บันทึกสำเร็จ', 'อัปเดตการตั้งค่าเรียบร้อยแล้ว')
      setModal(null)
    } finally {
      setSaving(false)
    }
  }

  const boolVal = key => String(settings[key] ?? '').toUpperCase() === 'TRUE'
  const setBool  = (key, val) => set(key, val ? 'TRUE' : 'FALSE')

  if (loading) return (
    <div className="flex justify-center h-64 items-center">
      <Loader2 className="animate-spin text-emerald-700" size={28}/>
    </div>
  )

  return (
    <div className="space-y-8 pb-10" style={{ fontFamily: 'Prompt, sans-serif' }}>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-emerald-950">Settings Hub</h1>
          <p className="text-slate-500 mt-2 text-base">ศูนย์ควบคุมพารามิเตอร์ระบบแพลตฟอร์ม TH Lotto</p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

        {/* 1. Financial */}
        <HubCard
          icon="💰"
          title="การเงิน"
          desc="กำหนดวงเงินฝาก-ถอน ขั้นต่ำ/สูงสุด อัตราค่าคอมมิชชั่น และเงื่อนไขการชำระเงิน"
          tag="Financial Config"
          onClick={() => setModal('financial')}
        />

        {/* 2. Bank */}
        <HubCard
          icon="🏦"
          title="บัญชีธนาคาร"
          desc="จัดการข้อมูลบัญชีรับเงิน ระบบจ่ายเงินอัตโนมัติ และการเชื่อมต่อ PromptPay"
          tag="Bank Accounts"
          onClick={() => setModal('bank')}
        />

        {/* 3. Lucky Wheel */}
        <HubCard
          icon="🎡"
          title="วงล้อเสี่ยงโชค"
          desc="ตั้งค่าราคาต่อรอบ เงื่อนไขยอดฝากขั้นต่ำ และจำนวนครั้งต่อวันสำหรับสมาชิก"
          tag="Game Management"
          onClick={() => setModal('wheel')}
        />

        {/* 4. Tracking & Social */}
        <HubCard
          icon="📊"
          title="Tracking & ช่องทางติดตาม"
          desc="ตั้งค่า Google Tag, Meta Pixel, TikTok Pixel, GA4 และช่องทางติดตาม LINE, Facebook, TikTok"
          tag="Marketing"
          onClick={() => setModal('social')}
        />

        {/* 5. Announcements + Popup */}
        <HubCard
          icon="📢"
          title="ประกาศ & Popup โฆษณา"
          desc="ข้อความวิ่ง (Marquee) + Popup โฆษณาหน้าแรก (รูป+ข้อความ)"
          tag="Engagement"
          onClick={() => setModal('announce')}
        />

        {/* 6. System */}
        <HubCard
          icon="⚙️"
          title="สถานะระบบ"
          desc="ควบคุมโหมดบำรุงรักษา (Maintenance) ตั้งค่า Timeout สลิป และความปลอดภัย"
          tag="Maintenance"
          onClick={() => setModal('system')}
        />

        {/* 7. Site Control — Owner Only */}
        {isOwner && (
          <button
            onClick={() => setModal('siteControl')}
            className="group text-left w-full p-8 rounded-[32px] transition-all duration-500 flex flex-col items-start gap-5 hover:-translate-y-2 focus:outline-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,245,245,0.95) 0%, rgba(254,226,226,0.88) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(254,202,202,0.6)',
              boxShadow: '0 4px 6px -1px rgba(185,28,28,0.06), 0 2px 4px -1px rgba(185,28,28,0.04), inset 0 1px 1px rgba(255,255,255,0.9)'
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(185,28,28,0.10), 0 10px 10px -5px rgba(185,28,28,0.06), inset 0 1px 2px rgba(255,255,255,1)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(185,28,28,0.06), 0 2px 4px -1px rgba(185,28,28,0.04), inset 0 1px 1px rgba(255,255,255,0.9)' }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
              style={{ background: 'linear-gradient(145deg, #ffffff, #fef2f2)', boxShadow: '4px 4px 10px rgba(185,28,28,0.08), -2px -2px 10px rgba(255,255,255,0.9)' }}
            >
              {siteEnabled ? '🟢' : '🔴'}
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="text-2xl font-bold text-red-950">ควบคุมเว็บไซต์</h3>
              <p className="text-sm text-red-700/60 leading-relaxed">
                {siteEnabled ? 'เว็บไซต์เปิดให้บริการอยู่' : '⚠️ เว็บไซต์ปิดชั่วคราว — ผู้ใช้ทั้งหมดเข้าไม่ได้'}
              </p>
            </div>
            <div className="pt-5 w-full border-t border-red-900/10 flex justify-between items-center">
              <span className="text-[10px] font-black text-red-700 uppercase tracking-[0.18em]">⚠️ Owner Only</span>
              <div className="w-8 h-8 rounded-full bg-red-900/5 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
              </div>
            </div>
          </button>
        )}

      </div>

      {/* ════════════ MODAL: Financial ════════════ */}
      <Modal
        open={modal === 'financial'}
        onClose={() => setModal(null)}
        title="การตั้งค่าพารามิเตอร์ทางการเงิน"
        icon="💰"
        footer={
          <>
            <button onClick={() => setModal(null)} className="px-6 py-3 rounded-full font-semibold text-slate-500 hover:bg-slate-100 transition-all">ยกเลิก</button>
            <SaveBtn loading={saving} onClick={() => saveGroup(['min_deposit','min_withdraw','max_withdraw_per_request','max_daily_withdraw','max_withdraw_per_day','min_bet','max_bet','auto_approve_deposit_limit','referral_commission_rate','commission_rate','deposit_enabled','withdraw_enabled'])}/>
          </>
        }
      >
        <div className="p-8 grid grid-cols-2 gap-6">
          <div className="col-span-2 flex gap-6">
            <Toggle checked={boolVal('deposit_enabled')} onChange={() => setBool('deposit_enabled', !boolVal('deposit_enabled'))} label="เปิดระบบฝากเงิน" sub="ปิดเพื่อหยุดรับฝากชั่วคราว" />
            <Toggle checked={boolVal('withdraw_enabled')} onChange={() => setBool('withdraw_enabled', !boolVal('withdraw_enabled'))} label="เปิดระบบถอนเงิน" sub="ปิดเพื่อหยุดรับถอนชั่วคราว" />
          </div>
          <Field label="ฝากเงินขั้นต่ำ">
            <NumberInput value={settings.min_deposit} onChange={v => set('min_deposit', v)} suffix="บาท"/>
          </Field>
          <Field label="ถอนเงินขั้นต่ำ">
            <NumberInput value={settings.min_withdraw} onChange={v => set('min_withdraw', v)} suffix="บาท"/>
          </Field>
          <Field label="ถอนสูงสุดต่อครั้ง">
            <NumberInput value={settings.max_withdraw_per_request} onChange={v => set('max_withdraw_per_request', v)} suffix="บาท"/>
          </Field>
          <Field label="ถอนสูงสุดต่อวัน">
            <NumberInput value={settings.max_daily_withdraw} onChange={v => set('max_daily_withdraw', v)} suffix="บาท"/>
          </Field>
          <Field label="จำนวนครั้งถอนต่อวัน">
            <NumberInput value={settings.max_withdraw_per_day} onChange={v => set('max_withdraw_per_day', v)} suffix="ครั้ง"/>
          </Field>
          <Field label="แทงขั้นต่ำต่อเลข">
            <NumberInput value={settings.min_bet} onChange={v => set('min_bet', v)} suffix="บาท"/>
          </Field>
          <Field label="แทงสูงสุดต่อเลข">
            <NumberInput value={settings.max_bet} onChange={v => set('max_bet', v)} suffix="บาท"/>
          </Field>
          <Field label="อนุมัติฝากออโต้ไม่เกิน">
            <NumberInput value={settings.auto_approve_deposit_limit} onChange={v => set('auto_approve_deposit_limit', v)} suffix="บาท"/>
          </Field>
          <Field label="Referral Commission">
            <NumberInput value={settings.referral_commission_rate} onChange={v => set('referral_commission_rate', v)} suffix="%"/>
          </Field>
          <Field label="อัตรา Commission ระบบ" >
            <NumberInput value={settings.commission_rate} onChange={v => set('commission_rate', v)} suffix="%"/>
          </Field>
        </div>
      </Modal>

      {/* ════════════ MODAL: Bank ════════════ */}
      <Modal
        open={modal === 'bank'}
        onClose={() => setModal(null)}
        title="ข้อมูลบัญชีธนาคารรับเงิน"
        icon="🏦"
        footer={
          <>
            <button onClick={() => setModal(null)} className="px-6 py-3 rounded-full font-semibold text-slate-500 hover:bg-slate-100 transition-all">ยกเลิก</button>
            <SaveBtn loading={saving} onClick={() => saveGroup(['company_bank_name','company_bank_code','company_bank_account_number','company_bank_account_name','company_promptpay_number','qr_payment_enabled'])}/>
          </>
        }
      >
        <div className="p-8 space-y-5">
          <Field label="ธนาคาร" hint="เลือกจากรายการธนาคารในระบบ (จัดการได้ที่เมนู ธนาคาร)">
            <BankSelector
              value={settings.company_bank_code}
              onChange={(code, bank) => {
                set('company_bank_code', code);
                set('company_bank_name', bank?.name || '');
              }}
              placeholder="เลือกธนาคาร"
            />
          </Field>
          <Field label="เลขที่บัญชี">
            <input
              type="text"
              value={settings.company_bank_account_number ?? ''}
              onChange={e => set('company_bank_account_number', e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-emerald-950 text-xl tracking-widest focus:ring-4 focus:ring-emerald-900/8 focus:border-emerald-900 transition-all outline-none"
            />
          </Field>
          <Field label="ชื่อบัญชี">
            <TextInput value={settings.company_bank_account_name} onChange={v => set('company_bank_account_name', v)}/>
          </Field>
          <Field label="เบอร์พร้อมเพย์">
            <TextInput value={settings.company_promptpay_number} onChange={v => set('company_promptpay_number', v)} placeholder="0812345678"/>
          </Field>
          <div className="flex items-center justify-between p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-xl">🔲</div>
              <div>
                <p className="font-bold text-emerald-950">PromptPay QR Payment</p>
                <p className="text-xs text-slate-400">รองรับการตรวจสลิปอัตโนมัติ</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setBool('qr_payment_enabled', !boolVal('qr_payment_enabled'))}
              className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${boolVal('qr_payment_enabled') ? 'bg-emerald-900' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${boolVal('qr_payment_enabled') ? 'translate-x-7' : ''}`}/>
            </button>
          </div>
        </div>
      </Modal>

      {/* ════════════ MODAL: Lucky Wheel ════════════ */}
      <Modal
        open={modal === 'wheel'}
        onClose={() => setModal(null)}
        title="ตั้งค่าวงล้อเสี่ยงโชค"
        icon="🎡"
        footer={
          <>
            <button onClick={() => setModal(null)} className="px-6 py-3 rounded-full font-semibold text-slate-500 hover:bg-slate-100 transition-all">ยกเลิก</button>
            <SaveBtn loading={saving} onClick={() => saveGroup(['lucky_wheel_enabled','lucky_wheel_cost','lucky_wheel_daily_limit','lucky_wheel_min_deposit'])}/>
          </>
        }
      >
        <div className="p-8 space-y-6">
          <Toggle
            checked={boolVal('lucky_wheel_enabled')}
            onChange={v => setBool('lucky_wheel_enabled', v)}
            label="สถานะกิจกรรม"
            sub="เปิด-ปิดการใช้งานวงล้อสำหรับผู้ใช้"
          />
          <Field label="ราคาต่อการหมุน">
            <NumberInput value={settings.lucky_wheel_cost} onChange={v => set('lucky_wheel_cost', v)} suffix="บาท"/>
          </Field>
          <Field label="จำนวนครั้งต่อวัน">
            <NumberInput value={settings.lucky_wheel_daily_limit} onChange={v => set('lucky_wheel_daily_limit', v)} suffix="ครั้ง"/>
          </Field>
          <Field label="ยอดฝากสะสมขั้นต่ำ" hint="ผู้เล่นต้องมียอดฝากสะสมถึงเกณฑ์จึงจะได้รับสิทธิ์หมุนฟรี">
            <NumberInput value={settings.lucky_wheel_min_deposit} onChange={v => set('lucky_wheel_min_deposit', v)} suffix="บาท"/>
          </Field>
        </div>
      </Modal>

      {/* ════════════ MODAL: Tracking & Social ════════════ */}
      <Modal
        open={modal === 'social'}
        onClose={() => setModal(null)}
        title="Tracking & ช่องทางติดตาม"
        icon="📊"
        footer={
          <>
            <button onClick={() => setModal(null)} className="px-6 py-3 rounded-full font-semibold text-slate-500 hover:bg-slate-100 transition-all">ยกเลิก</button>
            <SaveBtn loading={saving} onClick={() => saveGroup(['contact_line_url','contact_line_id','facebook_url','tiktok_url','telegram_url','gtm_id','meta_pixel_id','tiktok_pixel_id','ga4_id'])}/>
          </>
        }
      >
        <div className="p-8 space-y-6">
          {/* ── ช่องทางติดตาม ── */}
          <div>
            <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-5 h-0.5 bg-primary rounded-full"></span> ช่องทางติดตาม
            </h4>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> LINE URL
                  </label>
                  <TextInput value={settings.contact_line_url} onChange={v => set('contact_line_url', v)} placeholder="https://lin.ee/xxxxx"/>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> LINE ID
                  </label>
                  <TextInput value={settings.contact_line_id} onChange={v => set('contact_line_id', v)} placeholder="@thlotto"/>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span> Facebook Page
                  </label>
                  <TextInput value={settings.facebook_url} onChange={v => set('facebook_url', v)} placeholder="https://facebook.com/thlotto"/>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-pink-500"></span> TikTok
                  </label>
                  <TextInput value={settings.tiktok_url} onChange={v => set('tiktok_url', v)} placeholder="https://tiktok.com/@thlotto"/>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-500"></span> Telegram
                </label>
                <TextInput value={settings.telegram_url} onChange={v => set('telegram_url', v)} placeholder="https://t.me/thlotto"/>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100"></div>

          {/* ── Tracking Pixels ── */}
          <div>
            <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-5 h-0.5 bg-primary rounded-full"></span> Tracking Pixels
            </h4>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Google Tag Manager</label>
                  <TextInput value={settings.gtm_id} onChange={v => set('gtm_id', v)} placeholder="GTM-XXXXXXX"/>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Google Analytics (GA4)</label>
                  <TextInput value={settings.ga4_id} onChange={v => set('ga4_id', v)} placeholder="G-XXXXXXXXXX"/>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Meta Pixel (Facebook)</label>
                  <TextInput value={settings.meta_pixel_id} onChange={v => set('meta_pixel_id', v)} placeholder="1234567890"/>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">TikTok Pixel</label>
                  <TextInput value={settings.tiktok_pixel_id} onChange={v => set('tiktok_pixel_id', v)} placeholder="CXXXXXXXXX"/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* ════════════ MODAL: Announcements + Popup ════════════ */}
      <Modal
        open={modal === 'announce'}
        onClose={() => setModal(null)}
        title="ประกาศ & Popup โฆษณา"
        icon="📢"
        footer={
          <>
            <button onClick={() => setModal(null)} className="px-6 py-3 rounded-full font-semibold text-slate-500 hover:bg-slate-100 transition-all">ยกเลิก</button>
            <SaveBtn loading={saving} onClick={() => saveGroup(['announcement_enabled','announcement_text','popup_enabled','popup_title','popup_description','popup_image_url'])}/>
          </>
        }
      >
        <div className="p-8 space-y-6">
          {/* ── ข้อความวิ่ง (Marquee — CRUD announcements table) ── */}
          <div>
            <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-5 h-0.5 bg-primary rounded-full"></span> ข้อความวิ่ง (Marquee)
            </h4>
            <p className="text-[11px] text-slate-500 mb-3">จัดการข้อความที่วิ่งอยู่ด้านบนหน้าเว็บผู้ใช้ — แต่ละข้อความวิ่งเรียงกันคั่นด้วย " • "</p>

            {/* รายการข้อความปัจจุบัน */}
            <div className="space-y-2 mb-3">
              {announcements.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-sm bg-slate-50 rounded-xl">ยังไม่มีข้อความ</div>
              )}
              {announcements.map((a, idx) => (
                <div key={a.id} className={`flex items-center gap-2 p-2.5 rounded-xl border ${a.is_active ? 'bg-emerald-50/30 border-emerald-100' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                  <span className="text-[10px] font-bold text-slate-400 w-6 text-center">{idx + 1}</span>
                  <input
                    type="text"
                    value={a.content}
                    onChange={e => setAnnouncements(prev => prev.map(x => x.id === a.id ? { ...x, content: e.target.value } : x))}
                    onBlur={e => e.target.value !== a.content && updateAnnouncementContent(a.id, e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 font-medium"
                  />
                  <button
                    onClick={() => toggleAnnouncement(a.id, a.is_active)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${a.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}
                    title={a.is_active ? 'กดเพื่อปิด' : 'กดเพื่อเปิด'}
                  >
                    {a.is_active ? 'ON' : 'OFF'}
                  </button>
                  <button
                    onClick={() => deleteAnnouncement(a.id)}
                    className="text-rose-400 hover:text-rose-600 text-lg leading-none px-1"
                    title="ลบ"
                  >×</button>
                </div>
              ))}
            </div>

            {/* เพิ่มข้อความใหม่ */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newAnnouncement}
                onChange={e => setNewAnnouncement(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addAnnouncement()}
                placeholder="พิมพ์ข้อความใหม่..."
                className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-2.5 text-sm focus:ring-4 focus:ring-emerald-900/8 focus:border-emerald-900 outline-none"
              />
              <button
                onClick={addAnnouncement}
                className="px-5 py-2.5 bg-emerald-900 text-white text-sm font-bold rounded-2xl hover:scale-[1.03] active:scale-95 transition-all"
              >
                + เพิ่ม
              </button>
            </div>

            {/* Preview Marquee — รวมทุกข้อความ active */}
            {announcements.filter(a => a.is_active).length > 0 && (
              <div className="bg-primary/10 rounded-xl overflow-hidden border border-primary/20">
                <div className="px-3 py-1 bg-primary/20 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  <span className="text-[10px] font-bold text-primary uppercase">Preview (ตรงกับที่ User เห็น)</span>
                </div>
                <div className="overflow-hidden py-2 px-4">
                  <div className="flex animate-marquee whitespace-nowrap">
                    <span className="mx-4 text-sm font-medium text-primary">
                      {announcements.filter(a => a.is_active).map(a => a.content).join('  •  ')}
                    </span>
                    <span className="mx-4 text-sm font-medium text-primary">
                      {announcements.filter(a => a.is_active).map(a => a.content).join('  •  ')}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="h-px bg-slate-100"></div>

          {/* ── Popup โฆษณา ── */}
          <div>
            <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-5 h-0.5 bg-primary rounded-full"></span> Popup โฆษณาหน้าแรก
            </h4>
            <Toggle
              checked={boolVal('popup_enabled')}
              onChange={v => setBool('popup_enabled', v)}
              label="เปิด Popup โฆษณา"
              sub="แสดง Popup เมื่อเปิดหน้าแรก (ผู้ใช้กด 'ไม่แสดงอีก' ได้)"
            />
            <div className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">หัวเรื่อง</label>
                <TextInput value={settings.popup_title} onChange={v => set('popup_title', v)} placeholder="โปรโมชั่นพิเศษ!"/>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">รายละเอียด</label>
                <TextInput large value={settings.popup_description} onChange={v => set('popup_description', v)} placeholder="สมัครวันนี้รับโบนัสฟรี 50 บาท..."/>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">รูปภาพ (940×940 สี่เหลี่ยมจัตุรัส)</label>
                <div className="flex items-center gap-3">
                  <TextInput value={settings.popup_image_url} onChange={v => set('popup_image_url', v)} placeholder="URL รูปภาพ หรืออัปโหลด"/>
                  <label className="shrink-0 cursor-pointer bg-primary hover:bg-primary/90 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors">
                    {uploading ? '⏳ กำลังอัป...' : '📁 อัปโหลด'}
                    <input type="file" accept="image/*" className="hidden" onChange={async e => {
                      const file = e.target.files?.[0]; if (!file) return;
                      if (file.size > 5 * 1024 * 1024) { alert.error('ขนาดไฟล์ต้องไม่เกิน 5MB'); return; }
                      setUploading(true);
                      try {
                        const ext = file.name.split('.').pop();
                        const fileName = `popup/${Date.now()}.${ext}`;
                        const { error: upErr } = await supabase.storage.from('sliders').upload(fileName, file, { upsert: true });
                        if (upErr) throw upErr;
                        const { data: { publicUrl } } = supabase.storage.from('sliders').getPublicUrl(fileName);
                        set('popup_image_url', publicUrl);
                        alert.success('อัปโหลดสำเร็จ');
                      } catch (err) { alert.error('อัปโหลดล้มเหลว: ' + err.message); }
                      finally { setUploading(false); e.target.value = ''; }
                    }}/>
                  </label>
                </div>
              </div>
              {/* Preview Popup */}
              {(settings.popup_title || settings.popup_image_url) && (
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    <span className="text-[10px] font-bold text-primary uppercase">Popup Preview</span>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg border border-slate-100 max-w-xs mx-auto overflow-hidden">
                    {settings.popup_image_url && (
                      <img src={settings.popup_image_url} alt="popup" className="w-full aspect-square object-cover"/>
                    )}
                    <div className="p-4 space-y-2">
                      {settings.popup_title && <h3 className="font-bold text-slate-800 text-sm truncate">{settings.popup_title}</h3>}
                      {settings.popup_description && <p className="text-slate-500 text-xs line-clamp-3">{settings.popup_description}</p>}
                      <div className="flex gap-2 pt-2">
                        <button className="flex-1 py-2 bg-primary text-white text-xs font-bold rounded-lg">ดูเลย</button>
                        <button className="flex-1 py-2 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg">ไม่แสดงอีก</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* ════════════ MODAL: System ════════════ */}
      <Modal
        open={modal === 'system'}
        onClose={() => setModal(null)}
        title="Maintenance Mode & System"
        icon="⚙️"
        footer={
          <>
            <button onClick={() => setModal(null)} className="px-6 py-3 rounded-full font-semibold text-slate-500 hover:bg-slate-100 transition-all">ยกเลิก</button>
            <SaveBtn loading={saving} onClick={() => saveGroup(['maintenance_mode','system_status','deposit_timeout_seconds','auto_delete_notification_days'])}/>
          </>
        }
      >
        <div className="p-8 space-y-6">
          {/* Danger Zone */}
          <div className="p-7 bg-red-50 rounded-[24px] border-2 border-red-100 border-dashed text-center">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">⚠️</div>
            <h4 className="text-lg font-bold text-red-950 mb-1">โหมดปิดปรับปรุงระบบ</h4>
            <p className="text-sm text-red-600/80 mb-5">หากเปิดใช้งาน ผู้ใช้ทั่วไปจะไม่สามารถเข้าถึงหน้าเว็บได้</p>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setBool('maintenance_mode', !boolVal('maintenance_mode'))}
                className={`relative w-16 h-8 rounded-full transition-colors duration-200 shadow-inner ${boolVal('maintenance_mode') ? 'bg-red-600' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${boolVal('maintenance_mode') ? 'translate-x-8' : ''}`}/>
              </button>
            </div>
          </div>

          {/* System Status */}
          <Toggle
            checked={settings.system_status === 'ONLINE'}
            onChange={v => set('system_status', v ? 'ONLINE' : 'OFFLINE')}
            label="สถานะระบบ"
            sub="ONLINE = เปิดให้บริการ / OFFLINE = หยุดให้บริการ"
          />

          <Field label="Slip Verification Timeout">
            <NumberInput value={settings.deposit_timeout_seconds} onChange={v => set('deposit_timeout_seconds', v)} suffix="วินาที"/>
          </Field>

          <Field label="ลบแจ้งเตือนอัตโนมัติ (อายุเกิน)">
            <NumberInput value={settings.auto_delete_notification_days} onChange={v => set('auto_delete_notification_days', v)} suffix="วัน"/>
          </Field>
        </div>
      </Modal>

      {/* ════════════ MODAL: Site Control (Owner Only) ════════════ */}
      {isOwner && (
        <Modal
          open={modal === 'siteControl'}
          onClose={() => setModal(null)}
          title="ควบคุมการเข้าถึงเว็บไซต์"
          icon="🔴"
          footer={
            <>
              <button onClick={() => setModal(null)} className="px-6 py-3 rounded-full font-semibold text-slate-500 hover:bg-slate-100 transition-all">ยกเลิก</button>
              <SaveBtn loading={saving} onClick={() => saveGroup(['site_enabled'])}/>
            </>
          }
        >
          <div className="p-8 space-y-6">
            <div className="p-7 bg-red-50 rounded-[24px] border-2 border-red-200 space-y-5 text-center">
              <div className={`inline-flex w-16 h-16 rounded-full items-center justify-center text-3xl transition-all duration-300 ${siteEnabled ? 'bg-emerald-100' : 'bg-red-100'}`}>
                {siteEnabled ? '🟢' : '🔴'}
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900 mb-1">สถานะเว็บไซต์</h4>
                <p className={`text-sm font-semibold ${siteEnabled ? 'text-emerald-700' : 'text-red-700'}`}>
                  {siteEnabled ? '✅ เปิดให้บริการ — ผู้ใช้เข้าใช้งานได้ปกติ' : '🚫 ปิดชั่วคราว — ผู้ใช้ทุกคนเข้าไม่ได้'}
                </p>
              </div>
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setBool('site_enabled', !siteEnabled)}
                  className={`relative w-20 h-10 rounded-full transition-colors duration-300 shadow-inner ${siteEnabled ? 'bg-emerald-600' : 'bg-red-600'}`}
                >
                  <span className={`absolute top-1 left-1 w-8 h-8 bg-white rounded-full shadow-lg transition-transform duration-300 ${siteEnabled ? 'translate-x-10' : ''}`}/>
                </button>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                เมื่อปิด — ผู้ใช้ทุกคนจะเห็นหน้า "ระบบปิดชั่วคราว" แทนทันที<br/>
                เฉพาะเจ้าของระบบ (เบอร์นี้) เท่านั้นที่มองเห็นปุ่มนี้
              </p>
            </div>
          </div>
        </Modal>
      )}

    </div>
  )
}
