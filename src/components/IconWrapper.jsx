import React from 'react';

const IconWrapper = ({ icon: Icon, variant = 'default', size = 20, className = '' }) => {
  const variants = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-emerald-500/10 text-emerald-600',
    warning: 'bg-amber-500/10 text-amber-600',
    error: 'bg-red-500/10 text-red-600',
    info: 'bg-blue-500/10 text-blue-600',
  };
  
  return (
    <div className={`p-2.5 rounded-xl ${variants[variant]} backdrop-blur-sm ${className}`}>
      <Icon size={size} />
    </div>
  );
};

export default IconWrapper;
