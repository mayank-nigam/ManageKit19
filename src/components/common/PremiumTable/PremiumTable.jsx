import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, MoreVertical, ArrowUpDown } from 'lucide-react';
import { Tooltip, Radio } from 'antd';

const PremiumTable = ({ 
  columns, 
  dataSource, 
  rowKey = 'id', 
  loading = false,
  pagination = { pageSize: 10 },
  selectable = true,
  headerFilters = null
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  
  const pageSize = pagination?.pageSize || 10;
  const totalPages = Math.ceil((dataSource?.length || 0) / pageSize);
  const currentData = dataSource?.slice((currentPage - 1) * pageSize, currentPage * pageSize) || [];

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRowKeys(currentData.map((_, i) => dataSource[(currentPage - 1) * pageSize + i][rowKey] || i));
    } else {
      setSelectedRowKeys([]);
    }
  };

  const handleSelectRow = (key) => {
    setSelectedRowKeys(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  if (loading) {
    return (
      <div style={{ width: '100%', height: '256px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const allSelected = currentData.length > 0 && selectedRowKeys.length === currentData.length;
  // const someSelected = selectedRowKeys.length > 0 && selectedRowKeys.length < currentData.length;

  return (
    <div style={{
      boxShadow: 'none', border: 'none', borderBottom: '1px solid #ebedf2',
      borderRadius: 0, width: '100%', height: '100%', margin: 0,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      backgroundColor: '#ffffff'
    }}>
      <style>{`
        .premium-table-scroll-container::-webkit-scrollbar { width: 10px; height: 10px; }
        .premium-table-scroll-container::-webkit-scrollbar-track { background: #f8fafc; }
        .premium-table-scroll-container::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 5px; border: 2px solid #f8fafc; }
        .premium-table-scroll-container::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .premium-table-row:hover { background-color: #f8fafc; }
      `}</style>
      
      <div className="premium-table-scroll-container" style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'auto',
          minHeight: 0,
          backgroundColor: '#fff'
      }}>
        <table style={{ borderCollapse: 'separate', borderSpacing: 0, width: '100%', textAlign: 'left' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#ffffff' }}>
            
            {/* Top Filter Row (like Task module) */}
            {headerFilters && (
              <tr>
                <th colSpan={columns.length + (selectable ? 1 : 0)} style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff', fontWeight: 'normal' }}>
                  <Radio.Group 
                    value={headerFilters.value} 
                    onChange={(e) => headerFilters.onChange && headerFilters.onChange(e.target.value)}
                    className="flex gap-6 items-center text-[13.5px] text-[#1e293b]"
                  >
                    {headerFilters.options.map(opt => (
                      <Radio key={opt.value} value={opt.value} className="text-[#1e293b]">
                        {opt.label}
                      </Radio>
                    ))}
                  </Radio.Group>
                </th>
              </tr>
            )}

            {/* Column Headers */}
            <tr>
              {selectable && (
                <th style={{ padding: '12px 16px', paddingLeft: '16px', width: '52px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded cursor-pointer"
                    checked={allSelected}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              {columns.map((col, index) => (
                <th 
                  key={col.key || index} 
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#ffffff',
                    borderBottom: '1px solid #e2e8f0',
                    width: col.width,
                    textAlign: col.key === 'actions' ? 'right' : 'left'
                  }}
                >
                  <div className={`flex items-center gap-2 ${col.key === 'actions' ? 'justify-end' : ''}`}>
                    <div className='text-[13px] font-bold uppercase tracking-wider text-[#666666]'>
                      {col.title}
                    </div>
                    {col.key !== 'actions' && (
                      <div className="flex items-center">
                        <Tooltip title="Sort" placement="top">
                          <span className="flex items-center justify-center opacity-40 hover:opacity-100 hover:text-[#3b82f6] cursor-pointer transition-colors text-[#64748b]">
                            <ArrowUpDown size={14} strokeWidth={2.5} />
                          </span>
                        </Tooltip>
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ color: 'var(--mui-palette-text-secondary)' }}>
            <AnimatePresence>
              {currentData.length > 0 ? (
                currentData.map((record, rowIndex) => {
                  const key = record[rowKey] || rowIndex;
                  const isSelected = selectedRowKeys.includes(key);
                  return (
                    <motion.tr 
                      key={key}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className={`premium-table-row ${isSelected ? 'bg-[#f0f7ff]' : ''}`}
                      style={{ cursor: 'pointer' }}
                    >
                      {selectable && (
                        <td style={{ padding: '8px 16px', paddingLeft: '16px', width: '52px', borderBottom: '1px solid #ebedf2', textAlign: 'center' }}>
                          <input 
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded cursor-pointer"
                            checked={isSelected}
                            onChange={() => handleSelectRow(key)}
                          />
                        </td>
                      )}
                      {columns.map((col, colIndex) => (
                        <td 
                          key={col.key || colIndex} 
                          style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid #ebedf2',
                            fontSize: '13px',
                            color: '#334155',
                            textAlign: col.key === 'actions' ? 'right' : 'left'
                          }}
                        >
                          <div>
                             {col.render ? col.render(record[col.dataIndex], record, rowIndex) : record[col.dataIndex]}
                          </div>
                        </td>
                      ))}
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={columns.length + (selectable ? 1 : 0)} style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ color: '#444', fontSize: '15px', fontWeight: 600 }}>
                      No record Found.
                    </div>
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      
      {/* Pagination matching Kit19Sales exact style */}
      {totalPages > 0 && (
        <div className='flex items-center justify-end px-4 gap-4 border-t py-2' style={{ backgroundColor: '#fcfcfc', borderTop: '1px solid #ebedf2' }}>
            <div className='flex items-center gap-2 text-xs opacity-70'>
                <span>Go to page</span>
                <input
                    type='number'
                    value={currentPage}
                    min={1}
                    max={totalPages}
                    onChange={(e) => setCurrentPage(Math.max(1, Math.min(totalPages, Number(e.target.value))))}
                    style={{
                        width: '56px',
                        height: '28px',
                        textAlign: 'center',
                        fontSize: '13px',
                        border: '1px solid #dcdfe6',
                        borderRadius: '4px',
                        backgroundColor: '#fff',
                        outline: 'none'
                    }}
                />
            </div>
            <div className="flex gap-4 items-center text-xs opacity-70 ml-4">
              <span>{((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, dataSource.length)} of {dataSource.length}</span>
              <div className="flex gap-1">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ background: 'none', border: 'none', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.3 : 1 }}
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{ background: 'none', border: 'none', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.3 : 1 }}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default PremiumTable;
