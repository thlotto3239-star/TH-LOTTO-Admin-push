import React, { useState } from 'react';
import IconWrapper from './IconWrapper';

const SettingsSection = ({ title, icon: Icon, children, collapsible = false, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      <div 
        className="p-5 border-b border-white/10 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
        onClick={collapsible ? () => setIsOpen(!isOpen) : undefined}
      >
        <div className="flex items-center gap-3">
          <IconWrapper icon={Icon} variant="default" size={20} />
          <h3 className="text-lg font-semibold text-on-surface">{title}</h3>
        </div>
        {collapsible && (
          <span className={`material-icons text-on-surface-variant transition-transform ${isOpen ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        )}
      </div>
      {isOpen && (
        <div className="p-5 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default SettingsSection;
