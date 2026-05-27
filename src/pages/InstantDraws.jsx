import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import {
  Search, Filter, RefreshCw, Download
} from 'lucide-react'

const fmt = (n) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 0 })

export default function InstantDraws() {
  const [draws, setDraws] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 50

  const loadDraws = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.rpc('admin_get_instant_draws', {
        p_limit: pageSize,
        p_offset: page * pageSize
      })
      if (error) throw error
      setDraws(data || [])
    } catch (error) {
      console.error('Error loading draws:', error)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    loadDraws()
  }, [loadDraws])

  const filteredDraws = draws.filter(draw => {
    const matchesSearch = String(draw.draw_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (draw.result_6d && draw.result_6d.includes(searchTerm))
    const matchesStatus = statusFilter === 'all' || draw.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleExport = () => {
    const csv = [
      ['งวด', 'ผลรางวัล', 'สถานะ', 'รายการแทง', 'ยอดเดิมพัน', 'ยอดจ่าย', 'เวลา'],
      ...filteredDraws.map(d => [
        d.draw_id,
        d.result_6d || '-',
        d.status,
        d.total_bets,
        d.total_wagers,
        d.total_payouts,
        new Date(d.created_at).toLocaleString('th-TH')
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `instant_draws_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
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
          <h1 className="text-2xl font-bold text-on-surface">จัดการงวดออกรางวัลหวยหนึ่งนาที</h1>
          <p className="text-sm text-on-surface-variant mt-1">ดูและจัดการงวดออกรางวัลทั้งหมด</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadDraws}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary-hover transition"
          >
            <RefreshCw size={16} />
            รีเฟรช
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-on-secondary rounded-lg hover:bg-secondary-hover transition"
          >
            <Download size={16} />
            ส่งออก
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant" size={20} />
          <input
            type="text"
            placeholder="ค้นหางวดหรือผลรางวัล..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant" size={20} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-4 py-2 bg-surface border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">ทุกสถานะ</option>
            <option value="settled">จ่ายแล้ว</option>
            <option value="pending">รอจ่าย</option>
            <option value="cancelled">ยกเลิก</option>
          </select>
        </div>
      </div>

      {/* Draws Table */}
      <div className="glass-panel rounded-2xl p-6 shadow-glass">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline">
                <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">งวด</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">ผลรางวัล</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">สถานะ</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">รายการแทง</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">ยอดเดิมพัน</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">ยอดจ่าย</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">กำไร/ขาดทุน</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">เวลาออก</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">เวลาจ่าย</th>
              </tr>
            </thead>
            <tbody>
              {filteredDraws.map((draw) => (
                <tr key={draw.id} className="border-b border-outline hover:bg-surface-variant">
                  <td className="py-3 px-4 text-sm text-on-surface">{draw.draw_id}</td>
                  <td className="py-3 px-4 text-sm font-mono text-on-surface text-lg">
                    {draw.result_6d || '-'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      draw.status === 'settled' ? 'bg-primary-container text-on-primary-container' :
                      draw.status === 'pending' ? 'bg-warning-container text-on-warning-container' :
                      'bg-error-container text-on-error-container'
                    }`}>
                      {draw.status === 'settled' ? 'จ่ายแล้ว' :
                       draw.status === 'pending' ? 'รอจ่าย' : draw.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-on-surface">{fmt(draw.total_bets)}</td>
                  <td className="py-3 px-4 text-sm text-on-surface">{fmt(draw.total_wagers)}</td>
                  <td className="py-3 px-4 text-sm text-on-surface">{fmt(draw.total_payouts)}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={
                      (draw.total_wagers - draw.total_payouts) >= 0 
                        ? 'text-primary' 
                        : 'text-error'
                    }>
                      {fmt(draw.total_wagers - draw.total_payouts)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-on-surface-variant">
                    {new Date(draw.created_at).toLocaleString('th-TH')}
                  </td>
                  <td className="py-3 px-4 text-sm text-on-surface-variant">
                    {draw.settled_at ? new Date(draw.settled_at).toLocaleString('th-TH') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-on-surface-variant">
            แสดง {filteredDraws.length} รายการ
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-4 py-2 bg-surface border border-outline rounded-lg hover:bg-surface-variant disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ก่อนหน้า
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={filteredDraws.length < pageSize}
              className="px-4 py-2 bg-surface border border-outline rounded-lg hover:bg-surface-variant disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ถัดไป
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
