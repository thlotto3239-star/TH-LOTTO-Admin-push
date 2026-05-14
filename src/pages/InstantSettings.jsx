import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import {
  Settings, Save, RefreshCw, Clock, Zap, Shield, Bell
} from 'lucide-react'

export default function InstantSettings() {
  const [settings, setSettings] = useState({
    draw_interval: 60,
    auto_settle: true,
    max_bets_per_minute: 100,
    maintenance_mode: false,
    notification_enabled: true,
    log_retention_days: 30
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .in('key', ['instant_draw_interval', 'instant_auto_settle', 'instant_max_bets_per_minute', 'instant_maintenance_mode', 'instant_notification_enabled', 'instant_log_retention_days'])
      
      if (error) throw error
      
      const settingsMap = {}
      data.forEach(s => {
        settingsMap[s.key] = s.value
      })
      
      setSettings({
        draw_interval: parseInt(settingsMap.instant_draw_interval) || 60,
        auto_settle: settingsMap.instant_auto_settle === 'true',
        max_bets_per_minute: parseInt(settingsMap.instant_max_bets_per_minute) || 100,
        maintenance_mode: settingsMap.instant_maintenance_mode === 'true',
        notification_enabled: settingsMap.instant_notification_enabled === 'true',
        log_retention_days: parseInt(settingsMap.instant_log_retention_days) || 30
      })
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const handleSave = async () => {
    try {
      setSaving(true)
      
      const updates = [
        { key: 'instant_draw_interval', value: settings.draw_interval.toString() },
        { key: 'instant_auto_settle', value: settings.auto_settle.toString() },
        { key: 'instant_max_bets_per_minute', value: settings.max_bets_per_minute.toString() },
        { key: 'instant_maintenance_mode', value: settings.maintenance_mode.toString() },
        { key: 'instant_notification_enabled', value: settings.notification_enabled.toString() },
        { key: 'instant_log_retention_days', value: settings.log_retention_days.toString() }
      ]
      
      for (const update of updates) {
        const { error } = await supabase
          .from('settings')
          .upsert(update, { onConflict: 'key' })
        
        if (error) throw error
      }
      
      alert('บันทึกการตั้งค่าเรียบร้อยแล้ว')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('ไม่สามารถบันทึกการตั้งค่าได้')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

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
          <h1 className="text-2xl font-bold text-on-surface">ตั้งค่าระบบหวยหนึ่งนาที</h1>
          <p className="text-sm text-on-surface-variant mt-1">ตั้งค่าการทำงานของระบบหวยหนึ่งนาที</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadSettings}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-on-secondary rounded-lg hover:bg-secondary-hover transition"
          >
            <RefreshCw size={16} />
            รีเฟรช
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary-hover transition disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>

      {/* Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Draw Interval */}
        <div className="glass-panel rounded-2xl p-6 shadow-glass">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="text-primary" size={24} />
            <h2 className="text-lg font-semibold text-on-surface">ช่วงเวลาออกรางวัล</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">
                ช่วงเวลา (วินาที)
              </label>
              <input
                type="number"
                min="30"
                max="300"
                step="10"
                value={settings.draw_interval}
                onChange={(e) => handleChange('draw_interval', parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-surface border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-on-surface-variant mt-1">
                ระบบจะออกรางวัลทุก {settings.draw_interval} วินาที
              </p>
            </div>
          </div>
        </div>

        {/* Auto Settle */}
        <div className="glass-panel rounded-2xl p-6 shadow-glass">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="text-primary" size={24} />
            <h2 className="text-lg font-semibold text-on-surface">คำนวณผลอัตโนมัติ</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-on-surface">เปิดใช้งานคำนวณผลอัตโนมัติ</div>
                <div className="text-xs text-on-surface-variant mt-1">
                  ระบบจะคำนวณและจ่ายรางวัลอัตโนมัติหลังออกรางวัล
                </div>
              </div>
              <button
                onClick={() => handleChange('auto_settle', !settings.auto_settle)}
                className={`w-14 h-8 rounded-full p-1 transition-colors ${
                  settings.auto_settle ? 'bg-primary' : 'bg-outline'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                    settings.auto_settle ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Max Bets */}
        <div className="glass-panel rounded-2xl p-6 shadow-glass">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="text-primary" size={24} />
            <h2 className="text-lg font-semibold text-on-surface">ข้อจำกัด</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">
                รายการแทงสูงสุดต่อนาที
              </label>
              <input
                type="number"
                min="10"
                max="1000"
                step="10"
                value={settings.max_bets_per_minute}
                onChange={(e) => handleChange('max_bets_per_minute', parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-surface border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-on-surface-variant mt-1">
                ป้องกันการโจมตีระบบด้วยการแทงจำนวนมาก
              </p>
            </div>
          </div>
        </div>

        {/* Maintenance Mode */}
        <div className="glass-panel rounded-2xl p-6 shadow-glass">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="text-primary" size={24} />
            <h2 className="text-lg font-semibold text-on-surface">โหมดบำรุงรักษา</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-on-surface">เปิดโหมดบำรุงรักษา</div>
                <div className="text-xs text-on-surface-variant mt-1">
                  ปิดระบบหวยหนึ่งนาทีชั่วคราวเพื่อบำรุงรักษา
                </div>
              </div>
              <button
                onClick={() => handleChange('maintenance_mode', !settings.maintenance_mode)}
                className={`w-14 h-8 rounded-full p-1 transition-colors ${
                  settings.maintenance_mode ? 'bg-error' : 'bg-outline'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                    settings.maintenance_mode ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            {settings.maintenance_mode && (
              <div className="p-3 bg-error-container text-on-error-container rounded-lg text-sm">
                ⚠️ ระบบหวยหนึ่งนาทีถูกปิดชั่วคราว ผู้ใช้จะไม่สามารถแทงได้
              </div>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-panel rounded-2xl p-6 shadow-glass">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="text-primary" size={24} />
            <h2 className="text-lg font-semibold text-on-surface">การแจ้งเตือน</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-on-surface">เปิดการแจ้งเตือน</div>
                <div className="text-xs text-on-surface-variant mt-1">
                  แจ้งเตือนแอดมินเมื่อมีเหตุการณ์สำคัญ
                </div>
              </div>
              <button
                onClick={() => handleChange('notification_enabled', !settings.notification_enabled)}
                className={`w-14 h-8 rounded-full p-1 transition-colors ${
                  settings.notification_enabled ? 'bg-primary' : 'bg-outline'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                    settings.notification_enabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Log Retention */}
        <div className="glass-panel rounded-2xl p-6 shadow-glass">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="text-primary" size={24} />
            <h2 className="text-lg font-semibold text-on-surface">การเก็บข้อมูล</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">
                เก็บข้อมูล (วัน)
              </label>
              <input
                type="number"
                min="7"
                max="365"
                step="1"
                value={settings.log_retention_days}
                onChange={(e) => handleChange('log_retention_days', parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-surface border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-on-surface-variant mt-1">
                ระบบจะลบข้อมูลที่เก่ากว่า {settings.log_retention_days} วัน
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
