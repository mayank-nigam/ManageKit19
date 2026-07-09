import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarLocked, setSidebarLocked] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      const v = localStorage.getItem('sidebarCollapsed');
      return v === 'true';
    } catch (e) { return false; }
  });

  const [showGlobalAddMenu, setShowGlobalAddMenu] = useState(false);

  useEffect(() => {
    try { localStorage.setItem('sidebarCollapsed', sidebarCollapsed); } catch (e) { }
  }, [sidebarCollapsed]);

  const toggleSidebarLock = () => {
    setSidebarLocked(prev => !prev);
    if (sidebarLocked) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  };

  const handleSidebarMouseEnter = () => {
    if (!sidebarLocked) {
      setSidebarHovered(true);
      setSidebarOpen(true);
    }
  };

  const handleSidebarMouseLeave = () => {
    if (!sidebarLocked) {
      setSidebarHovered(false);
      setSidebarOpen(false);
    }
  };

  const effectiveSidebarOpen = sidebarLocked || sidebarHovered || sidebarOpen;

  const handleSetSidebarOpen = (val) => {
    if (!val) {
      setSidebarOpen(false);
      setSidebarLocked(false);
      setSidebarHovered(false);
    } else {
      setSidebarOpen(true);
    }
  };

  return (
    <div className="flex h-screen w-full relative overflow-hidden bg-transparent">
      <Sidebar
        isOpen={effectiveSidebarOpen}
        setIsOpen={handleSetSidebarOpen}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        isLocked={sidebarLocked}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          toggleSidebarLock={toggleSidebarLock}
          sidebarLocked={sidebarLocked}
          onAddClick={() => setShowGlobalAddMenu(true)}
        />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {showGlobalAddMenu && (
        <div 
          className="fixed inset-0 z-[6500] bg-black/40 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setShowGlobalAddMenu(false)}
        >
          <div className="bg-white p-6 rounded-lg" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-4">Admin Global Action</h2>
            <p>Admin quick actions go here.</p>
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => setShowGlobalAddMenu(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
