import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Save, Loader2, Palette, Globe, Image, Smartphone, Upload, RotateCcw, Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'
import { toast } from '../components/Toast'

export default function Appearance() {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState({})
  const [preview, setPreview] = useState({})

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const { data } = await supabase.from('settings').select('key,value').in('key', [
      'site_name', 'site_logo_url', 'site_favicon_url', 'site_primary_color', 'terms_html'
    ])
    const map = {}
    data?.forEach(s => { map[s.key] = s.value })
    setSettings(map)
    setPreview(map)
    setLoading(false)
  }

  const handleFileUpload = async (key, file) => {
    if (!file) return
    setUploading(u => ({ ...u, [key]: true }))
    
    const fileName = `${key}/${Date.now()}_${file.name}`
    const { error: uploadError } = await supabase.storage.from('appearance').upload(fileName, file)
    
    if (uploadError) {
      toast.error('Upload ล้มเหลว: ' + uploadError.message)
      setUploading(u => ({ ...u, [key]: false }))
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('appearance').getPublicUrl(fileName)
    setSettings(s => ({ ...s, [key]: publicUrl }))
    setPreview(p => ({ ...p, [key]: publicUrl }))
    setUploading(u => ({ ...u, [key]: false }))
  }

  const saveAll = async () => {
    setSaving(true)
    const promises = Object.entries(settings).map(([key, value]) =>
      supabase.rpc('admin_upsert_setting', { p_key: key, p_value: String(value ?? '') })
    )
    await Promise.all(promises)
    setSaving(false)
    toast.success('บันทึกเรียบร้อย')
  }

  const reset = () => {
    setSettings(preview)
    toast.info('คืนค่าเดิมแล้ว')
  }

  if (loading) return <div className="flex justify-center h-32 items-center"><Loader2 className="animate-spin text-primary" size={24}/></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Control Center — ออกแบบเว็บไซต์</h1>
        <p className="text-on-surface-variant text-sm">ปรับหน้าตาแอปฯ ได้โดยไม่ต้องแก้ไขโค้ด</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Settings */}
        <div className="space-y-6">
          {/* Brand Section */}
          <div className="glass-panel rounded-2xl shadow-glass p-6">
            <h3 className="font-semibold text-on-surface-variant mb-4 flex items-center gap-2">
              <Palette size={18}/> แก้ไขข้อมูลแบรนด์
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-on-surface-variant mb-1 block">Brand Name</label>
                <input 
                  value={settings.site_name || ''} 
                  onChange={e => setSettings(s => ({ ...s, site_name: e.target.value }))}
                  className="w-full bg-surface-container-low border-none rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="TH-LOTTO"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-on-surface-variant mb-1 block">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={settings.site_primary_color || '#10b981'} 
                    onChange={e => setSettings(s => ({ ...s, site_primary_color: e.target.value }))}
                    className="h-10 w-12 rounded-lg border-none cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={settings.site_primary_color || '#10b981'} 
                    onChange={e => setSettings(s => ({ ...s, site_primary_color: e.target.value }))}
                    className="flex-1 bg-surface-container-low border-none rounded-full px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Assets Upload Section */}
          <div className="glass-panel rounded-2xl shadow-glass p-6">
            <h3 className="font-semibold text-on-surface-variant mb-4 flex items-center gap-2">
              <Image size={18}/> จัดการไฟล์สื่อ
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-on-surface-variant mb-1 block">Logo</label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 bg-surface-container-low border-2 border-dashed border-outline-variant/30 rounded-xl px-4 py-3 cursor-pointer hover:border-primary/50 transition">
                    <Upload size={16} className="text-outline"/>
                    <span className="text-sm text-on-surface-variant">{uploading.site_logo_url ? 'กำลังอัปโหลด...' : 'เลือกไฟล์'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload('site_logo_url', e.target.files[0])} />
                  </label>
                  {settings.site_logo_url && (
                    <img src={settings.site_logo_url} alt="preview" className="w-12 h-12 rounded-lg object-contain bg-white border border-outline-variant/30" />
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-on-surface-variant mb-1 block">Favicon</label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 bg-surface-container-low border-2 border-dashed border-outline-variant/30 rounded-xl px-4 py-3 cursor-pointer hover:border-primary/50 transition">
                    <Upload size={16} className="text-outline"/>
                    <span className="text-sm text-on-surface-variant">{uploading.site_favicon_url ? 'กำลังอัปโหลด...' : 'เลือกไฟล์'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload('site_favicon_url', e.target.files[0])} />
                  </label>
                  {settings.site_favicon_url && (
                    <img src={settings.site_favicon_url} alt="preview" className="w-8 h-8 rounded object-contain bg-white border border-outline-variant/30" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Terms Editor */}
          <div className="glass-panel rounded-2xl shadow-glass p-6">
            <h3 className="font-semibold text-on-surface-variant mb-4 flex items-center gap-2">
              <Globe size={18}/> ข้อตกลงและเงื่อนไข
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-2">
                <button className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant"><Bold size={16}/></button>
                <button className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant"><Italic size={16}/></button>
                <button className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant"><AlignLeft size={16}/></button>
                <button className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant"><AlignCenter size={16}/></button>
                <button className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant"><AlignRight size={16}/></button>
              </div>
              <textarea 
                value={settings.terms_html || ''} 
                onChange={e => setSettings(s => ({ ...s, terms_html: e.target.value }))}
                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none h-32 font-mono"
                placeholder="<li>...</li>"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button onClick={saveAll} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-full font-semibold text-sm transition disabled:opacity-60">
              {saving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} บันทึกการเปลี่ยนแปลง
            </button>
            <button onClick={reset} className="px-6 py-3 bg-surface-container hover:bg-surface-container-high rounded-full text-sm text-on-surface-variant transition flex items-center gap-2">
              <RotateCcw size={16}/> คืนค่าเดิม
            </button>
          </div>
        </div>

        {/* Right Panel: Live Preview */}
        <div className="glass-panel rounded-2xl shadow-glass p-6">
          <h3 className="font-semibold text-on-surface-variant mb-4 flex items-center gap-2">
            <Smartphone size={18}/> Live Preview
          </h3>
          <div className="flex justify-center">
            <div className="w-72 h-[580px] bg-white rounded-[2.5rem] border-8 border-slate-800 p-3 shadow-2xl">
              <div className="w-full h-full bg-slate-50 rounded-2xl overflow-hidden flex flex-col">
                {/* Status Bar */}
                <div className="h-6 bg-slate-800 flex items-center justify-between px-3">
                  <span className="text-[10px] text-white">9:41</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 bg-white rounded-full opacity-80"></div>
                    <div className="w-3 h-3 bg-white rounded-full opacity-80"></div>
                  </div>
                </div>
                {/* App Header */}
                <div className="p-4" style={{ backgroundColor: settings.site_primary_color || '#10b981' }}>
                  <div className="flex items-center gap-3">
                    {settings.site_logo_url ? (
                      <img src={settings.site_logo_url} alt="logo" className="w-10 h-10 rounded-lg object-contain bg-white" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold">L</div>
                    )}
                    <div>
                      <h1 className="text-white font-bold text-lg">{settings.site_name || 'TH-LOTTO'}</h1>
                      <p className="text-white/80 text-xs">แทงหวยออนไลน์</p>
                    </div>
                  </div>
                </div>
                {/* App Content */}
                <div className="flex-1 p-4 space-y-3">
                  <div className="bg-white rounded-xl p-3 shadow-sm">
                    <div className="h-3 bg-slate-200 rounded w-3/4 mb-2"></div>
                    <div className="h-2 bg-slate-100 rounded w-1/2"></div>
                  </div>
                  <div className="bg-white rounded-xl p-3 shadow-sm">
                    <div className="h-3 bg-slate-200 rounded w-2/3 mb-2"></div>
                    <div className="h-2 bg-slate-100 rounded w-1/3"></div>
                  </div>
                  <div className="bg-white rounded-xl p-3 shadow-sm">
                    <div className="h-3 bg-slate-200 rounded w-5/6 mb-2"></div>
                    <div className="h-2 bg-slate-100 rounded w-2/5"></div>
                  </div>
                </div>
                {/* Bottom Nav */}
                <div className="h-16 bg-white border-t border-slate-200 flex items-center justify-around px-4">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: settings.site_primary_color || '#10b981' }}></div>
                    <span className="text-[10px] text-slate-600">หน้าแรก</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-slate-200"></div>
                    <span className="text-[10px] text-slate-400">แทงหวย</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-slate-200"></div>
                    <span className="text-[10px] text-slate-400">กระเป๋า</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
