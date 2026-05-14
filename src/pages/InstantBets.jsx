import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import {
  Search, Filter, RefreshCw, Download, User
} from 'lucide-react'

const fmt = (n) => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 0 })

export default function InstantBets() {
  const [bets, setBets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [drawIdFilter, setDrawIdFilter] = useState('')
  const [page, setPage] = useState(0)
  const pageSize = 50

  const loadBets = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.rpc('admin_get_instant_bets', {
        p_limit: pageSize,
        p_offset: page * pageSize,
        p_draw_id: drawIdFilter || null
      })
      if (error) throw error
      setBets(data || [])
    } catch (error) {
      console.error('Error loading bets:', error)
    } finally {
      setLoading(false)
    }
  }, [page, drawIdFilter])

  useEffect(() => {
    loadBets()
  }, [loadBets])

  const filteredBets = bets.filter(bet => {
    const matchesSearch = bet.phone.includes(searchTerm) ||
                         bet.numbers.includes(searchTerm)
    const matchesStatus = statusFilter === 'all' || bet.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleExport = () => {
    const csv = [
      ['เบอร์โทรศัพท์', 'งวด', 'ประเภท', 'เลข', 'ยอดเดิมพัน', 'ยอดจ่าย', 'สถานะ', 'เวลา'],
      ...filteredBets.map(b => [
        b.phone,
        b.draw_id,
        b.bet_type,
        b.numbers,
        b.amount,
        b.winnings,
        b.is_win ? 'ชนะ' : b.status,
        new Date(b.created_at).toLocaleString('th-TH')
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `instant_bets_${new Date().toISOString().split('T')[0]}.csv`
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
          <h1 className="text-2xl font-bold text-on-surface">รายการแทงหวยหนึ่งนาที</h1>
          <p className="text-sm text-on-surface-variant mt-1">ดูและจัดการรายการแทงทั้งหมด</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadBets}
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
            placeholder="ค้นหาเบอร์โทรศัพท์หรือเลข..."
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
            <option value="pending">รอผล</option>
            <option value="settled">จ่ายแล้ว</option>
            <option value="cancelled">ยกเลิก</option>
          </select>
        </div>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant" size={20} />
          <input
            type="text"
            placeholder="งวด..."
            value={drawIdFilter}
            onChange={(e) => setDrawIdFilter(e.target.value)}
            className="w-40 pl-10 pr-4 py-2 bg-surface border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Bets Table */}
      <div className="glass-panel rounded-2xl p-6 shadow-glass">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline">
                <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">เบอร์โทรศัพท์</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">งวด</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">ประเภท</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">เลข</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">ยอดเดิมพัน</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">ยอดจ่าย</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">กำไร/ขาดทุน</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">สถานะ</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-on-surface-variant">เวลา</th>
              </tr>
            </thead>
            <tbody>
              {filteredBets.map((bet) => (
                <tr key={bet.id} className="border-b border-outline hover:bg-surface-variant">
                  <td className="py-3 px-4 text-sm text-on-surface">{bet.phone}</td>
                  <td className="py-3 px-4 text-sm text-on-surface">{bet.draw_id}</td>
                  <td className="py-3 px-4 text-sm text-on-surface">{bet.bet_type}</td>
                  <td className="py-3 px-4 text-sm font-mono text-on-surface">{bet.numbers}</td>
                  <td className="py-3 px-4 text-sm text-on-surface">{fmt(bet.amount)}</td>
                  <td className="py-3 px-4 text-sm text-on-surface">{fmt(bet.winnings)}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={
                      (bet.amount - bet.winnings) >= 0 
                        ? 'text-primary' 
                        : 'text-error'
                    }>
                      {fmt(bet.amount - bet.winnings)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      bet.is_win ? 'bg-primary-container text-on-primary-container' :
                      bet.status === 'pending' ? 'bg-warning-container text-on-warning-container' :
                      'bg-error-container text-on-error-container'
                    }`}>
                      {bet.is_win ? 'ชนะ' :
                       bet.status === 'pending' ? 'รอผล' : bet.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-on-surface-variant">
                    {new Date(bet.created_at).toLocaleString('th-TH')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-on-surface-variant">
            แสดง {filteredBets.length} รายการ
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
              disabled={filteredBets.length < pageSize}
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
