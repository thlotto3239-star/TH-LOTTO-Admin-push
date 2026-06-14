import React from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const StatusBadge = ({ status, label, size = 'sm' }) => {
  const statuses = {
    active: { 
      color: 'bg-emerald-500', 
      icon: CheckCircle, 
      defaultLabel: 'เปิดใช้งาน',
      textColor: 'text-white'
    },
    inactive: { 
      color: 'bg-slate-400', 
      icon: XCircle, 
      defaultLabel: 'ปิดใช้งาน',
      textColor: 'text-white'
    },
    pending: { 
      color: 'bg-amber-500', 
      icon: Clock, 
      defaultLabel: 'รอดำเนินการ',
      textColor: 'text-white'
    },
    error: { 
      color: 'bg-red-500', 
      icon: AlertCircle, 
      defaultLabel: 'ผิดพลาด',
      textColor: 'text-white'
    },
    success: { 
      color: 'bg-emerald-500', 
      icon: CheckCircle, 
      defaultLabel: 'สำเร็จ',
      textColor: 'text-white'
    },
  };
  
  const config = statuses[status] || statuses.pending;
  const Icon = config.icon;
  const displayLabel = label || config.defaultLabel;
  
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };
  
  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };
  
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full whitespace-nowrap ${config.color} ${config.textColor} ${sizeClasses[size]}`}>
      <Icon size={iconSizes[size]} />
      {displayLabel}
    </div>
  );
};

export default StatusBadge;
