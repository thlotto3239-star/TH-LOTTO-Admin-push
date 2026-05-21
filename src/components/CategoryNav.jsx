import React from 'react';

const CategoryNav = ({ categories, activeCategory, onSelect }) => {
  return (
    <nav className="space-y-1">
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            activeCategory === cat.id
              ? 'bg-primary text-white shadow-lg'
              : 'text-on-surface-variant hover:bg-white/50'
          }`}
        >
          <div className={`p-2 rounded-lg ${activeCategory === cat.id ? 'bg-white/20' : cat.color}`}>
            <cat.icon size={18} />
          </div>
          <span className="font-medium">{cat.label}</span>
          {cat.badge && (
            <span className="ml-auto px-2 py-0.5 rounded-full bg-white/20 text-xs">
              {cat.badge}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
};

export default CategoryNav;
