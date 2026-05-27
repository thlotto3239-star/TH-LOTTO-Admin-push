import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const ProfessionalTable = ({ columns, data, emptyMessage = 'ไม่มีข้อมูล' }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);
  
  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-primary/5 sticky top-0">
            <tr>
              {columns.map(col => (
                <th 
                  key={col.key} 
                  className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    {col.sortable !== false && (
                      <div className="flex flex-col">
                        <ChevronUp 
                          size={14} 
                          className={`text-outline ${sortConfig.key === col.key && sortConfig.direction === 'asc' ? 'text-primary' : ''}`} 
                        />
                        <ChevronDown 
                          size={14} 
                          className={`text-outline -mt-2 ${sortConfig.key === col.key && sortConfig.direction === 'desc' ? 'text-primary' : ''}`} 
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-on-surface-variant">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row, i) => (
                <tr 
                  key={i} 
                  className="hover:bg-primary/[0.02] transition-colors border-b border-white/5 last:border-0"
                >
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3 text-sm text-on-surface whitespace-nowrap">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProfessionalTable;
