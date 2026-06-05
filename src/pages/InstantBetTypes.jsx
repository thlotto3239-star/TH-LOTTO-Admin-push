import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import { Edit, ToggleLeft, ToggleRight, Save, X, Search } from 'lucide-react'
import { toast } from '../components/Toast'

const fmt = (n) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })

export default function InstantBetTypes() {
  const [betTypes, setBetTypes]   = useState([])
  const [editing, setEditing]     = useState(null)
  const [loading, setLoading]     = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [editForm, setEditForm]   = useState({})

  const loadBetTypes = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('admin_get_instant_bet_types')
    if (error) {
      toast.error('โหลดข้อมูลล้มเหลว: ' + error.message)
    } else {
      setBetTypes(data || [])
    } catch (err) {
      console.error('Error loading bet types:', err)
      toast.error('โหลดข้อมูลไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadBetTypes() }, [loadBetTypes])

  const handleEdit = (bt) => {
    setEditing(bt.id)
    setEditForm({
      name:       bt.name,
      rate:       bt.rate,
      min_digits: bt.min_digits,
      max_digits: bt.max_digits,
    })
  }

  const handleCancel = () => { setEditing(null); setEditForm({}) }

  const handleSave = async (id) => {
    try {
      const { error } = await supabase.rpc('admin_update_instant_bet_type', {
        p_id:         id,
        p_name:       editForm.name,
        p_rate:       editForm.rate,
        p_min_digits: editForm.min_digits,
        p_max_digits: editForm.max_digits,
      })
      if (error) throw error
      setEditing(null)
      setEditForm({})
      loadBetTypes()
      toast.success('บันทึกเรียบร้อยแล้ว')
    } catch (err) {
      console.error('Error updating bet type:', err)
      toast.error('ไม่สามารถบันทึกข้อมูลได้')
    }
  }

  const handleToggle = async (id) => {
    try {
      const { error } = await supabase.rpc('admin_toggle_instant_bet_type', { p_id: id })
      if (error) throw error
      loadBetTypes()
    } catch (err) {
      console.error('Error toggling bet type:', err)
      toast.error('ไม่สามารถเปลี่ยนสถานะได้')
    }
  }

  // RPC returns: id, code, name, rate, min_digits, max_digits, is_positioned, display_order, is_active
  const filteredTypes = betTypes.filter(bt =>
    bt.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bt.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">จัดการประเภทเดิมพันหวยหนึ่งนาที</h1>
        <p className="text-sm text-on-surface-variant mt-1">ตั้งค่าประเภทเดิมพันและอัตราจ่าย</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
        <input
          type="text"
          placeholder="ค้นหาประเภทเดิมพัน..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-700"
        />
      </div>

      {/* Table */}
      <div className="bg-surface-container-low rounded-2xl p-6 shadow-glass">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline">
                <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">โค้ด</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">ชื่อ</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">อัตราจ่าย (x)</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">หลักต่ำสุด</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">หลักสูงสุด</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">ปักหลัก</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">สถานะ</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredTypes.map((bt) => (
                <tr key={bt.id} className="border-b border-outline hover:bg-surface-variant transition-colors">
                  {editing === bt.id ? (
                    <>
                      {/* code (readonly) */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm text-on-surface">{bt.code}</span>
                      </td>
                      {/* name */}
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-3 py-2 bg-surface border border-outline rounded-lg text-sm"
                        />
                      </td>
                      {/* rate */}
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.rate}
                          onChange={(e) => setEditForm({ ...editForm, rate: parseFloat(e.target.value) })}
                          className="w-24 px-3 py-2 bg-surface border border-outline rounded-lg text-sm"
                        />
                      </td>
                      {/* min_digits */}
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          step="1"
                          value={editForm.min_digits}
                          onChange={(e) => setEditForm({ ...editForm, min_digits: parseInt(e.target.value) })}
                          className="w-20 px-3 py-2 bg-surface border border-outline rounded-lg text-sm"
                        />
                      </td>
                      {/* max_digits */}
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          step="1"
                          value={editForm.max_digits}
                          onChange={(e) => setEditForm({ ...editForm, max_digits: parseInt(e.target.value) })}
                          className="w-20 px-3 py-2 bg-surface border border-outline rounded-lg text-sm"
                        />
                      </td>
                      {/* is_positioned (display only) */}
                      <td className="py-3 px-4 text-sm text-on-surface-variant">
                        {bt.is_positioned ? '✓' : '-'}
                      </td>
                      {/* is_active (display only while editing) */}
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${bt.is_active ? 'bg-primary-container text-on-primary-container' : 'bg-error-container text-on-error-container'}`}>
                          {bt.is_active ? 'เปิด' : 'ปิด'}
                        </span>
                      </td>
                      {/* actions */}
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button onClick={() => handleSave(bt.id)} className="p-2 bg-primary text-on-primary rounded-lg hover:opacity-80 transition">
                            <Save size={16} />
                          </button>
                          <button onClick={handleCancel} className="p-2 bg-error text-on-error rounded-lg hover:opacity-80 transition">
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-4 text-sm font-mono text-on-surface">{bt.code}</td>
                      <td className="py-3 px-4 text-sm text-on-surface">{bt.name}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-primary">{fmt(bt.rate)}</td>
                      <td className="py-3 px-4 text-sm text-on-surface">{bt.min_digits}</td>
                      <td className="py-3 px-4 text-sm text-on-surface">{bt.max_digits}</td>
                      <td className="py-3 px-4 text-sm text-on-surface-variant">{bt.is_positioned ? '✓' : '-'}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggle(bt.id)}
                          className={`p-2 rounded-lg transition ${bt.is_active ? 'bg-primary-container text-on-primary-container hover:opacity-80' : 'bg-error-container text-on-error-container hover:opacity-80'}`}
                        >
                          {bt.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <button onClick={() => handleEdit(bt)} className="p-2 bg-secondary text-on-secondary rounded-lg hover:opacity-80 transition">
                          <Edit size={16} />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {filteredTypes.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-on-surface-variant text-sm">ไม่พบข้อมูล</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
