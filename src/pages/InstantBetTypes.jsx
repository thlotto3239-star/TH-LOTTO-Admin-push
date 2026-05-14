import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import {
  Edit, ToggleLeft, ToggleRight, Plus, Save, X, Search
} from 'lucide-react'

const fmt = (n) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })

export default function InstantBetTypes() {
  const [betTypes, setBetTypes] = useState([])
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [editForm, setEditForm] = useState({})

  const loadBetTypes = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.rpc('admin_get_instant_bet_types')
      if (error) throw error
      setBetTypes(data || [])
    } catch (error) {
      console.error('Error loading bet types:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBetTypes()
  }, [loadBetTypes])

  const handleEdit = (betType) => {
    setEditing(betType.id)
    setEditForm({
      name_th: betType.name_th,
      name_en: betType.name_en,
      payout_rate: betType.payout_rate,
      min_bet: betType.min_bet,
      max_bet: betType.max_bet,
      description: betType.description
    })
  }

  const handleCancel = () => {
    setEditing(null)
    setEditForm({})
  }

  const handleSave = async (id) => {
    try {
      const { error } = await supabase.rpc('admin_update_instant_bet_type', {
        p_id: id,
        p_name_th: editForm.name_th,
        p_name_en: editForm.name_en,
        p_payout_rate: editForm.payout_rate,
        p_min_bet: editForm.min_bet,
        p_max_bet: editForm.max_bet,
        p_description: editForm.description
      })

      if (error) throw error
      
      setEditing(null)
      setEditForm({})
      loadBetTypes()
    } catch (error) {
      console.error('Error updating bet type:', error)
      alert('ไม่สามารถบันทึกข้อมูลได้')
    }
  }

  const handleToggle = async (id) => {
    try {
      const { error } = await supabase.rpc('admin_toggle_instant_bet_type', { p_id: id })
      if (error) throw error
      loadBetTypes()
    } catch (error) {
      console.error('Error toggling bet type:', error)
      alert('ไม่สามารถเปลี่ยนสถานะได้')
    }
  }

  const filteredTypes = betTypes.filter(type =>
    type.bet_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.name_th.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.name_en.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <h1 className="text-2xl font-bold text-on-surface">จัดการประเภทเดิมพันหวยหนึ่งนาที</h1>
          <p className="text-sm text-on-surface-variant mt-1">ตั้งค่าประเภทเดิมพันและอัตราจ่าย</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant" size={20} />
        <input
          type="text"
          placeholder="ค้นหาประเภทเดิมพัน..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-surface border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Bet Types Table */}
      <div className="glass-panel rounded-2xl p-6 shadow-glass">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline">
                <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">ประเภท</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">ชื่อไทย</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">ชื่ออังกฤษ</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">อัตราจ่าย</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">ขั้นต่ำ</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">สูงสุด</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">สถานะ</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredTypes.map((type) => (
                <tr key={type.id} className="border-b border-outline hover:bg-surface-variant">
                  {editing === type.id ? (
                    <>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={type.bet_type}
                          disabled
                          className="w-full px-3 py-2 bg-surface border border-outline rounded-lg"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={editForm.name_th}
                          onChange={(e) => setEditForm({...editForm, name_th: e.target.value})}
                          className="w-full px-3 py-2 bg-surface border border-outline rounded-lg"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={editForm.name_en}
                          onChange={(e) => setEditForm({...editForm, name_en: e.target.value})}
                          className="w-full px-3 py-2 bg-surface border border-outline rounded-lg"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          step="0.1"
                          value={editForm.payout_rate}
                          onChange={(e) => setEditForm({...editForm, payout_rate: parseFloat(e.target.value)})}
                          className="w-full px-3 py-2 bg-surface border border-outline rounded-lg"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          step="1"
                          value={editForm.min_bet}
                          onChange={(e) => setEditForm({...editForm, min_bet: parseFloat(e.target.value)})}
                          className="w-full px-3 py-2 bg-surface border border-outline rounded-lg"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          step="1"
                          value={editForm.max_bet}
                          onChange={(e) => setEditForm({...editForm, max_bet: parseFloat(e.target.value)})}
                          className="w-full px-3 py-2 bg-surface border border-outline rounded-lg"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          type.is_active ? 'bg-primary-container text-on-primary-container' : 'bg-error-container text-on-error-container'
                        }`}>
                          {type.is_active ? 'เปิด' : 'ปิด'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSave(type.id)}
                            className="p-2 bg-primary text-on-primary rounded-lg hover:bg-primary-hover transition"
                          >
                            <Save size={16} />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="p-2 bg-error text-on-error rounded-lg hover:bg-error-hover transition"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-4 text-sm font-mono text-on-surface">{type.bet_type}</td>
                      <td className="py-3 px-4 text-sm text-on-surface">{type.name_th}</td>
                      <td className="py-3 px-4 text-sm text-on-surface">{type.name_en}</td>
                      <td className="py-3 px-4 text-sm text-on-surface">{fmt(type.payout_rate)}</td>
                      <td className="py-3 px-4 text-sm text-on-surface">{fmt(type.min_bet)}</td>
                      <td className="py-3 px-4 text-sm text-on-surface">{fmt(type.max_bet)}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggle(type.id)}
                          className={`p-2 rounded-lg transition ${
                            type.is_active 
                              ? 'bg-primary-container text-on-primary-container hover:bg-primary-hover' 
                              : 'bg-error-container text-on-error-container hover:bg-error-hover'
                          }`}
                        >
                          {type.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleEdit(type)}
                          className="p-2 bg-secondary text-on-secondary rounded-lg hover:bg-secondary-hover transition"
                        >
                          <Edit size={16} />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
