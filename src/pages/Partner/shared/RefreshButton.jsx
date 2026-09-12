import React, { useState } from 'react';
import { RotateCw } from 'lucide-react';

// Small icon-only refresh control shown alongside a page's filter bar - re-runs the
// current query without changing any filter values. Spins briefly on click to give
// feedback even though the mock fetch is fast.
const RefreshButton = ({ onRefresh, title = 'Refresh' }) => {
  const [spinning, setSpinning] = useState(false);

  const handleClick = async () => {
    setSpinning(true);
    await onRefresh();
    setTimeout(() => setSpinning(false), 300);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={title}
      aria-label={title}
      className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 shrink-0"
    >
      <RotateCw size={15} className={spinning ? 'animate-spin' : ''} />
    </button>
  );
};

export default RefreshButton;
