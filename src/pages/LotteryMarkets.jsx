import React, { useEffect, useState, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { Loader2 } from 'lucide-react'
import { toast } from '../components/Toast'

// ─── Constants ────────────────────────────────────────────────────────────────
const DAYS = [
  { num: 1, short: 'จ.' },
  { num: 2, short: 'อ.' },
  { num: 3, short: 'พ.' },
  { num: 4, short: 'พฤ.' },
  { num: 5, short: 'ศ.' },
  { num: 6, short: 'ส.' },
  { num: 7, short: 'อา.' },
]

const BET_TYPES = [
  { key: '4TOP',     label: '4 ตัวบน' },
  { key: '3TOP',     label: '3 ตัวบน' },
  { key: '3TODE',    label: '3 ตัวโต๊ด' },
  { key: '3FRONT',   label: '3 ตัวหน้า' },
  { key: '3BOTTOM',  label: '3 ตัวล่าง' },
  { key: '2TOP',     label: '2 ตัวบน' },
  { key: '2BOTTOM',  label: '2 ตัวล่าง' },
  { key: 'RUN_UP',   label: 'วิ่งบน' },
  { key: 'RUN_DOWN', label: 'วิ่งล่าง' },
]

// ─── DayPill ──────────────────────────────────────────────────────────────────
function DayPill({ day, selected, onToggle }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(day.num)}
      className={`w-10 h-10 flex items-center justify-center rounded-full text-xs font-bold transition-all duration-200 active:scale-90
        ${selected
          ? 'bg-[#064e3b] text-white shadow-md shadow-emerald-900/25'
          : 'bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-800'
        }`}
    >
      {day.short}
    </button>
  )
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${checked ? 'bg-[#064e3b]' : 'bg-slate-200'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow border border-slate-200 transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`} />
    </button>
  )
}

// ─── Market Card ─────────────────────────────────────────────────────────────
function MarketCard({ m, mRates, onEdit }) {
  const days = m.draw_days || []

  return (
    <div
      className="rounded-3xl p-8 flex flex-col gap-6 transition-all duration-400"
      style={{
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.35)',
        boxShadow: '0 4px 16px -4px rgba(6,78,59,0.07)',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(6,78,59,0.12)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px -4px rgba(6,78,59,0.07)' }}
    >
      {/* Header Row */}
      <div className="flex justify-between items-start">
        <div className="flex gap-5 items-center">
          {/* Logo */}
          <div className="relative shrink-0">
            {m.logo_url
              ? <img src={m.logo_url} alt={m.name} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"/>
              : <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-white shadow-md flex items-center justify-center text-2xl font-black text-emerald-800">{m.code?.slice(0,2)}</div>
            }
            <button
              onClick={() => onEdit(m)}
              className="absolute -bottom-1 -right-1 bg-white w-7 h-7 rounded-full shadow-lg border border-slate-100 flex items-center justify-center hover:text-emerald-700 transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          </div>

          {/* Name & Tags */}
          <div>
            <h3 className="text-2xl font-bold text-emerald-900 leading-tight">{m.name}</h3>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">{m.code}</span>
              {m.show_in_popular && <span className="bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">Popular</span>}
              {m.show_in_trending && <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">Hot</span>}
            </div>
          </div>
        </div>

        {/* Active Toggle */}
        <Toggle checked={!!m.is_active} onChange={async (v) => {
          await supabase.from('lottery_markets').update({ is_active: v }).eq('id', m.id)
          window.location.reload()
        }}/>
      </div>

      {/* Draw Days + Auto-Close */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">วันออกผล</label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map(d => (
              <DayPill key={d.num} day={d} selected={days.includes(d.num)} onToggle={() => {}} />
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">ปิดรับก่อน</label>
          <div className="relative">
            <div className="w-full bg-slate-100/70 rounded-full px-5 py-3 font-bold text-emerald-950 text-sm flex items-center justify-between">
              <span>{m.close_minutes_before ?? 30}</span>
              <span className="text-slate-400 text-xs font-bold">นาที</span>
            </div>
          </div>
        </div>
      </div>

      {/* Time */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">เวลาออกรางวัล</label>
          <div className="bg-slate-100/70 rounded-full px-5 py-3 font-bold text-emerald-950 text-sm">{m.draw_time?.slice(0,5) || '—'} น.</div>
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">สถานะ</label>
          <div className={`rounded-full px-5 py-3 text-sm font-bold ${m.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
            {m.is_active ? '🟢 เปิดใช้งาน' : '⚫ ปิดใช้งาน'}
          </div>
        </div>
      </div>

      {/* YouTube Live */}
      {m.stream_url && (
        <div className="space-y-2">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">YouTube Live</label>
          <div className="flex items-center gap-3">
            <div className="flex-1 relative bg-slate-100/70 rounded-full px-5 py-3 flex items-center gap-3 overflow-hidden">
              <svg className="text-red-500 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.38.45A3.07 3.07 0 0 0 .5 6.19C.07 8.07 0 12 0 12s.07 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.5 20.4 12 20.4 12 20.4s7.5 0 9.38-.45a3.02 3.02 0 0 0 2.12-2.14C23.93 15.93 24 12 24 12s-.07-3.93-.5-5.81zM9.75 15.52V8.48L15.89 12l-6.14 3.52z"/></svg>
              <span className="text-xs text-slate-600 truncate">{m.stream_url}</span>
            </div>
            <a href={m.stream_url} target="_blank" rel="noreferrer" className="bg-slate-900 text-white px-4 py-3 rounded-full hover:bg-black transition-colors flex items-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            </a>
          </div>
        </div>
      )}

      {/* Payout Rates preview */}
      {Object.keys(mRates).length > 0 && (
        <div className="pt-4 border-t border-slate-100">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">อัตราจ่ายรางวัล</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(mRates).map(([bt, rate]) => (
              <span key={bt} className="bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-full text-xs font-bold">
                {BET_TYPES.find(b => b.key === bt)?.label || bt}: <span className="text-emerald-600">{rate}x</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Edit Button */}
      <button
        onClick={() => onEdit(m)}
        className="w-full mt-1 py-3.5 rounded-2xl bg-emerald-900 text-white text-sm font-bold hover:bg-emerald-800 transition-colors shadow-lg shadow-emerald-900/15 flex items-center justify-center gap-2"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        แก้ไขตลาด
      </button>
    </div>
  )
}

// ─── Add Market Card ──────────────────────────────────────────────────────────
function AddCard({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-3xl border-2 border-dashed border-emerald-900/12 flex flex-col items-center justify-center p-12 group hover:border-emerald-900/30 transition-colors cursor-pointer min-h-[400px] w-full"
    >
      <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-900 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </div>
      <h3 className="text-xl font-bold text-emerald-900 mb-2">เพิ่มตลาดหวยใหม่</h3>
      <p className="text-slate-400 text-center text-sm max-w-xs leading-relaxed">คลิกที่นี่เพื่อสร้างตลาดหวยหรือหุ้นใหม่เข้าสู่ระบบ</p>
    </button>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function MarketModal({ modal, setModal, rates, setRates, onSave, working, setWorking }) {
  if (!modal) return null

  const days = modal.draw_days || []

  const toggleDay = (num) => {
    const newDays = days.includes(num) ? days.filter(d => d !== num) : [...days, num].sort()
    setModal(m => ({ ...m, draw_days: newDays }))
  }

  const isNew = !modal.id

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,53,39,0.25)', backdropFilter: 'blur(8px)' }}>
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-white/50">

        {/* Modal Header */}
        <div className="p-7 border-b border-slate-100 flex justify-between items-start bg-white/80">
          <div>
            <h2 className="text-2xl font-bold text-emerald-950">{isNew ? 'เพิ่มตลาดหวยใหม่' : `ตั้งค่าตลาด: ${modal.name}`}</h2>
            <p className="text-slate-400 text-sm mt-1">กำหนดรายละเอียดและเงื่อนไขการออกรางวัล</p>
          </div>
          <button onClick={() => setModal(null)} className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-7 space-y-7" style={{ scrollbarWidth: 'none' }}>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2 flex flex-col gap-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">ชื่อตลาดหวย</label>
              <input
                type="text"
                value={modal.name || ''}
                onChange={e => setModal(m => ({ ...m, name: e.target.value }))}
                className="w-full bg-slate-100/70 border-2 border-transparent focus:border-emerald-800 rounded-2xl px-5 py-3.5 font-semibold text-emerald-950 outline-none transition-all"
                placeholder="เช่น หวยลาวพัฒนา"
              />
            </div>

            {isNew && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">รหัสตลาด (Code)</label>
                <input
                  type="text"
                  value={modal.code || ''}
                  onChange={e => setModal(m => ({ ...m, code: e.target.value.toUpperCase() }))}
                  className="w-full bg-slate-100/70 border-2 border-transparent focus:border-emerald-800 rounded-2xl px-5 py-3.5 font-mono font-bold text-emerald-950 outline-none transition-all"
                  placeholder="เช่น LAO_DEV"
                />
              </div>
            )}

            {/* Logo File Upload & URL Input */}
            <div className="col-span-2 flex flex-col gap-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">โลโก้ตลาดหวย</label>
              <div className="flex gap-4 items-center">
                <label className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 hover:border-emerald-800 hover:bg-emerald-50/30 rounded-2xl py-4 cursor-pointer transition-all">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0]
                      if (!file) return
                      if (file.size > 5 * 1024 * 1024) { toast.error('ขนาดไฟล์ต้องไม่เกิน 5MB'); return }
                      setWorking(true)
                      try {
                        const ext = file.name.split('.').pop()
                        const fileName = `markets/${Date.now()}.${ext}`
                        const { error: upErr } = await supabase.storage.from('sliders').upload(fileName, file, { upsert: true })
                        if (upErr) throw upErr
                        const { data: { publicUrl } } = supabase.storage.from('sliders').getPublicUrl(fileName)
                        setModal(m => ({ ...m, logo_url: publicUrl }))
                        toast.success('อัปโหลดโลโก้สำเร็จ')
                      } catch (err) {
                        toast.error('อัปโหลดล้มเหลว: ' + err.message)
                      } finally {
                        setWorking(false)
                      }
                    }}
                  />
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-400"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <span className="text-sm font-bold text-slate-500">อัปโหลดไฟล์ภาพ (สูงสุด 5MB)</span>
                </label>
                {modal.logo_url && (
                  <img src={modal.logo_url} alt="preview" className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md shrink-0"/>
                )}
              </div>
              <input
                type="text"
                value={modal.logo_url || ''}
                onChange={e => setModal(m => ({ ...m, logo_url: e.target.value }))}
                className="w-full bg-slate-100/70 border-2 border-transparent focus:border-emerald-800 rounded-2xl px-5 py-3 text-sm text-emerald-950 outline-none transition-all mt-1"
                placeholder="หรือระบุลิงก์รูปภาพโลโก้ตรงนี้..."
              />
            </div>
          </div>

          {/* Draw Days */}
          <div className="space-y-3">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">วันที่ออกรางวัล (Draw Days)</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(d => (
                <DayPill key={d.num} day={d} selected={days.includes(d.num)} onToggle={toggleDay} />
              ))}
            </div>
          </div>

          {/* Time & Buffer */}
          <div className="grid grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">เวลาออกรางวัล</label>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <input
                  type="time"
                  value={modal.draw_time?.slice(0,5) || ''}
                  onChange={e => setModal(m => ({ ...m, draw_time: e.target.value }))}
                  className="w-full pl-11 pr-5 py-3.5 bg-slate-100/70 border-2 border-transparent focus:border-emerald-800 rounded-2xl outline-none font-semibold text-emerald-950 transition-all"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">ปิดรับก่อนออกผล (นาที)</label>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                <input
                  type="number"
                  value={modal.close_minutes_before || 0}
                  onChange={e => setModal(m => ({ ...m, close_minutes_before: e.target.value }))}
                  className="w-full pl-11 pr-5 py-3.5 bg-slate-100/70 border-2 border-transparent focus:border-emerald-800 rounded-2xl outline-none font-semibold text-emerald-950 transition-all"
                />
              </div>
            </div>
          </div>

          {/* YouTube */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">YouTube URL ถ่ายทอดสด</label>
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.38.45A3.07 3.07 0 0 0 .5 6.19C.07 8.07 0 12 0 12s.07 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.5 20.4 12 20.4 12 20.4s7.5 0 9.38-.45a3.02 3.02 0 0 0 2.12-2.14C23.93 15.93 24 12 24 12s-.07-3.93-.5-5.81zM9.75 15.52V8.48L15.89 12l-6.14 3.52z"/></svg>
              <input
                type="url"
                value={modal.stream_url || ''}
                onChange={e => setModal(m => ({ ...m, stream_url: e.target.value }))}
                placeholder="https://youtube.com/live/..."
                className="w-full pl-11 pr-5 py-3.5 bg-slate-100/70 border-2 border-transparent focus:border-emerald-800 rounded-2xl outline-none text-emerald-950 transition-all"
              />
            </div>
          </div>

          {/* CSV URL + Result Source */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">แหล่งดึงผลรางวัล</label>
            <select
              value={modal.result_source || 'csv'}
              onChange={e => setModal(m => ({ ...m, result_source: e.target.value }))}
              className="w-full px-4 py-3.5 bg-slate-100/70 border-2 border-transparent focus:border-emerald-800 rounded-2xl outline-none text-emerald-950 transition-all"
            >
              <option value="csv">CSV (Google Sheets)</option>
              <option value="web">Web Scraping (คมชัดลึก)</option>
              <option value="manual">กรอกมือ (Manual)</option>
            </select>
          </div>
          {(modal.result_source === 'csv' || !modal.result_source) && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Google Sheets CSV URL</label>
              <input
                type="url"
                value={modal.csv_url || ''}
                onChange={e => setModal(m => ({ ...m, csv_url: e.target.value }))}
                placeholder="https://docs.google.com/spreadsheets/.../export?format=csv"
                className="w-full px-4 py-3.5 bg-slate-100/70 border-2 border-transparent focus:border-emerald-800 rounded-2xl outline-none text-emerald-950 transition-all"
              />
            </div>
          )}

          {/* Visibility Toggles */}
          <div className="space-y-3">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">การแสดงผล</label>
            <div className="flex items-center justify-between p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-900 flex items-center justify-center text-white">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </div>
                <div>
                  <p className="font-bold text-emerald-950 text-sm">แสดงบนรายการยอดนิยม</p>
                  <p className="text-xs text-slate-400">แสดงผลตลาดนี้ในส่วน Popular ของหน้าแรก</p>
                </div>
              </div>
              <Toggle checked={!!modal.show_in_popular} onChange={v => setModal(m => ({ ...m, show_in_popular: v }))}/>
            </div>
            <div className="flex items-center justify-between p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-900 flex items-center justify-center text-white">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                </div>
                <div>
                  <p className="font-bold text-emerald-950 text-sm">แสดงบนรายการมาแรง</p>
                  <p className="text-xs text-slate-400">แสดงผลตลาดนี้ในส่วน Trending</p>
                </div>
              </div>
              <Toggle checked={!!modal.show_in_trending} onChange={v => setModal(m => ({ ...m, show_in_trending: v }))}/>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${modal.is_active ? 'bg-emerald-900 text-white' : 'bg-slate-300 text-slate-500'}`}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <div>
                  <p className="font-bold text-emerald-950 text-sm">เปิดใช้งานตลาดนี้</p>
                  <p className="text-xs text-slate-400">ผู้ใช้จะสามารถเลือกแทงตลาดนี้ได้</p>
                </div>
              </div>
              <Toggle checked={!!modal.is_active} onChange={v => setModal(m => ({ ...m, is_active: v }))}/>
            </div>
          </div>

          {/* Payout Rates */}
          <div className="space-y-4">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
              อัตราจ่ายรางวัล (เท่า) {modal.code && <span className="font-mono normal-case">— {modal.code}</span>}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {BET_TYPES.map(bt => (
                <div key={bt.key} className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{bt.label}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={rates[bt.key] ?? ''}
                    placeholder="ไม่ใช้"
                    onChange={e => setRates(r => ({ ...r, [bt.key]: e.target.value }))}
                    className="w-full bg-slate-100/70 border-2 border-transparent focus:border-emerald-800 rounded-2xl px-4 py-3 text-sm font-semibold text-emerald-950 outline-none transition-all"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-slate-50/70 border-t border-slate-100 flex gap-3 justify-end">
          <button onClick={() => setModal(null)} className="px-6 py-3 rounded-full font-semibold text-slate-500 hover:bg-slate-200 transition-all">
            ยกเลิก
          </button>
          <button
            onClick={onSave}
            disabled={working}
            className="bg-emerald-900 text-white px-9 py-3 rounded-full font-bold shadow-lg shadow-emerald-900/20 hover:scale-[1.03] transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {working ? <Loader2 size={16} className="animate-spin"/> : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            )}
            บันทึกการตั้งค่า
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LotteryMarkets() {
  const [markets, setMarkets] = useState([])
  const [allRates, setAllRates] = useState({})
  const [loading, setLoading]  = useState(true)
  const [modal, setModal]      = useState(null)
  const [rates, setRates]      = useState({})
  const [working, setWorking]  = useState(false)

  const load = async () => {
    const [mRes, rRes] = await Promise.all([
      supabase.from('lottery_markets').select('*').order('display_order'),
      supabase.from('payout_rates').select('market,bet_type,rate'),
    ])
    setMarkets(mRes.data || [])
    const grouped = {}
    ;(rRes.data || []).forEach(r => {
      if (!grouped[r.market]) grouped[r.market] = {}
      grouped[r.market][r.bet_type] = r.rate
    })
    setAllRates(grouped)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openEdit = (m) => {
    setRates({ ...(allRates[m.code] || {}) })
    setModal({ ...m })
  }

  const openNew = () => {
    setRates({})
    setModal({ name: '', code: '', logo_url: '', stream_url: '', csv_url: '', result_source: 'csv', draw_time: '', close_minutes_before: 30, draw_days: [], is_active: true, show_in_popular: false, show_in_trending: false })
  }

  const save = async () => {
    if (!modal.name) { toast.warning('กรุณากรอกชื่อตลาด'); return }
    setWorking(true)
    try {
      if (modal.id) {
        // Update existing
        const { error } = await supabase.from('lottery_markets').update({
          name: modal.name,
          logo_url: modal.logo_url,
          stream_url: modal.stream_url || '',
          csv_url: modal.csv_url || null,
          result_source: modal.result_source || 'csv',
          draw_time: modal.draw_time,
          draw_days: modal.draw_days,
          close_minutes_before: Number(modal.close_minutes_before),
          is_active: modal.is_active,
          show_in_popular: modal.show_in_popular,
          show_in_trending: modal.show_in_trending,
        }).eq('id', modal.id)
        if (error) { toast.error('เกิดข้อผิดพลาด: ' + error.message); return }
      } else {
        // Insert new
        if (!modal.code) { toast.warning('กรุณากรอกรหัสตลาด'); return }
        const { error } = await supabase.from('lottery_markets').insert({
          name: modal.name,
          code: modal.code,
          logo_url: modal.logo_url,
          stream_url: modal.stream_url || '',
          csv_url: modal.csv_url || null,
          result_source: modal.result_source || 'csv',
          draw_time: modal.draw_time,
          draw_days: modal.draw_days,
          close_minutes_before: Number(modal.close_minutes_before),
          is_active: modal.is_active,
          show_in_popular: modal.show_in_popular,
          show_in_trending: modal.show_in_trending,
        })
        if (error) { toast.error('เกิดข้อผิดพลาด: ' + error.message); return }
      }

      // Save payout rates
      const codeToUse = modal.code
      for (const [bet_type, rate] of Object.entries(rates)) {
        if (rate === '' || rate === null || rate === undefined) continue
        await supabase.from('payout_rates')
          .upsert({ market: codeToUse, bet_type, rate: Number(rate) }, { onConflict: 'market,bet_type' })
      }

      toast.success('บันทึกสำเร็จ')
      setModal(null)
      load()
    } finally {
      setWorking(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center h-64 items-center">
      <Loader2 className="animate-spin text-emerald-700" size={28}/>
    </div>
  )

  return (
    <div className="space-y-8 pb-12" >

      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[#022c22]">จัดการตลาดหวย</h1>
          <p className="text-slate-500 mt-2 text-base">Lottery Markets Management &amp; Configuration</p>
        </div>
        <button
          onClick={openNew}
          className="bg-[#064e3b] text-white px-8 py-4 rounded-full font-bold flex items-center gap-3 hover:scale-105 transition-transform shadow-xl shadow-emerald-900/20"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          เพิ่มตลาดหวยใหม่
        </button>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {markets.map(m => (
          <MarketCard
            key={m.id}
            m={m}
            mRates={allRates[m.code] || {}}
            onEdit={openEdit}
          />
        ))}
        <AddCard onClick={openNew} />
      </div>

      {/* Edit Modal */}
      <MarketModal
        modal={modal}
        setModal={setModal}
        rates={rates}
        setRates={setRates}
        onSave={save}
        working={working}
        setWorking={setWorking}
      />
    </div>
  )
}
