import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

/**
 * BankSelector — Dropdown เลือกธนาคารจากตาราง banks (Admin App)
 */
export default function BankSelector({ value, onChange, placeholder = 'เลือกธนาคาร' }) {
  const [banks, setBanks] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('banks')
        .select('code, name, image_url')
        .eq('is_active', true)
        .order('name');
      setBanks(data || []);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = banks.find(b => b.code === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-emerald-700 transition focus:outline-none focus:ring-2 focus:ring-emerald-700"
      >
        {selected ? (
          <>
            {selected.image_url
              ? <img src={selected.image_url} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
              : <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-black text-slate-500 shrink-0">{selected.code.slice(0,3)}</div>}
            <div className="flex-1 text-left min-w-0">
              <div className="font-bold text-slate-900 truncate text-sm">{selected.name}</div>
              <div className="text-xs font-mono text-slate-400">{selected.code}</div>
            </div>
          </>
        ) : (
          <span className="flex-1 text-left text-slate-400 text-sm">{loading ? 'กำลังโหลด...' : placeholder}</span>
        )}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`text-slate-400 transition ${open ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"/></svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-2xl max-h-72 overflow-y-auto">
          {banks.map(b => (
            <button
              key={b.code}
              type="button"
              onClick={() => { onChange(b.code, b); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-50 transition text-left ${value === b.code ? 'bg-emerald-50' : ''}`}
            >
              {b.image_url
                ? <img src={b.image_url} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                : <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-black text-slate-500 shrink-0">{b.code.slice(0,3)}</div>}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-900 text-sm truncate">{b.name}</div>
                <div className="text-xs font-mono text-slate-400">{b.code}</div>
              </div>
              {value === b.code && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-emerald-600"><polyline points="20 6 9 17 4 12"/></svg>
              )}
            </button>
          ))}
          {banks.length === 0 && !loading && (
            <p className="px-4 py-6 text-center text-sm text-slate-400">ไม่พบข้อมูลธนาคาร</p>
          )}
        </div>
      )}
    </div>
  );
}
