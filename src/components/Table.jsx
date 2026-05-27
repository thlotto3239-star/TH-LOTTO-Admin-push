import React from 'react'

const Table = ({ columns, data, loading, emptyMessage = 'ไม่มีข้อมูล' }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-outline">
        <div className="text-4xl mb-2">📭</div>
        <div className="text-sm">{emptyMessage}</div>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-surface-container text-on-surface-variant text-left border-b border-outline-variant/30">
          <tr>
            {columns.map((column, index) => (
              <th key={index} className="px-4 py-3 font-medium whitespace-nowrap">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-outline-variant/10 hover:bg-surface-container-highest transition-colors">
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="px-4 py-3 whitespace-nowrap">
                  {column.render ? column.render(row, rowIndex) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Table
