import React, { useState, useEffect } from 'react';
import { Box, Typography, Checkbox, Skeleton } from '@mui/material';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { User, Search, FileText, Calendar } from 'lucide-react';
import UniversalDetailContent from './UniversalDetailContent';
import AppointmentTypeIcon from '../../../pages/PhysicalAppointment/Components/AppointmentTypeIcon';
import ScoreCard from '../ScoreCard/ScoreCard';
import Loader from '../../Loader/Loader';
import { IconList } from '../../../pages/Master_Settings/IconList';
import './GridMainPanelLayout.css';

const ASSETS_BASE_URL = (process.env.REACT_APP_ASSETS_BASE_URL || '').replace(/\/$/, '');

const renderDynamicIcon = (iconPath, defaultIcon, size = 26) => {
    if (iconPath && IconList && IconList[iconPath]) {
      return (
        <div 
          className="svg-icon-container" 
          dangerouslySetInnerHTML={{ __html: IconList[iconPath] }} 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: `${size}px`, height: `${size}px` }}
        />
      );
    }
    if (iconPath && (iconPath.includes('/') || iconPath.includes('.'))) {
      let imgSrc = iconPath;
      if (!imgSrc.startsWith('http')) {
        imgSrc = `${ASSETS_BASE_URL}/${iconPath.replace(/^\//, '')}`;
      }
      return <img src={imgSrc} alt="icon" style={{ width: `${size}px`, height: `${size}px`, objectFit: 'contain' }} />;
    }
    if (iconPath) {
        return <i className={`fa ${iconPath}`} style={{ fontSize: `${size-6}px`, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', width: `${size}px`, height: `${size}px` }}></i>;
    }
    return defaultIcon;
};

/**
 * GridMainPanelLayout - A reusable split-view layout for CRM modules.
 * Left: Scrollable list of items with mass selection support.
 * Right: Detailed view using UniversalDetailContent.
 */
const getAvatarStyle = (name) => {
    const palettes = [
        { bg: '#eff6ff', text: '#3b82f6', border: '#dbeafe' }, // Blue
        { bg: '#ecfdf5', text: '#10b981', border: '#d1fae5' }, // Green
        { bg: '#fff1f2', text: '#f43f5e', border: '#ffe4e6' }, // Rose
        { bg: '#fffbeb', text: '#f59e0b', border: '#fef3c7' }, // Amber
        { bg: '#f5f3ff', text: '#8b5cf6', border: '#ede9fe' }, // Violet
        { bg: '#ecfeff', text: '#06b6d4', border: '#cffafe' }, // Cyan
        { bg: '#f0fdf4', text: '#16a34a', border: '#dcfce7' }, // Green 2
        { bg: '#faf5ff', text: '#9333ea', border: '#f3e8ff' }, // Purple
        { bg: '#fff7ed', text: '#ea580c', border: '#ffedd5' }, // Orange
        { bg: '#fdf2f8', text: '#db2777', border: '#fce7f3' }  // Pink
    ];
    if (!name || name === '-') return palettes[0];

    // Better hashing for uniqueness
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % palettes.length;
    return palettes[index];
};

const GridMainPanelLayout = ({
    type = 'task', // 'task', 'physical-appointment', 'followup', 'enquiry'
    data = [],
    loading,
    isLoading,
    totalRecords = 0,
    currentPage = 1,
    totalPages = 1,
    onPageChange,
    selectedItem,
    onSelectItem,
    // Task selection props
    rowSelection = {},
    onRowSelectionChange,
    // Enquiry selection props
    selectedEnquiries = [],
    setSelectedEnquiries,
    isAllSelectedAcrossPages = false,
    setIsAllSelectedAcrossPages,
    excludedEnquiries = [],
    setExcludedEnquiries,
    onViewLead,
    getCompletionBadge, // (item) => JSX
    formatDate, // (date) => string
    getInitials, // (name) => string
    emptyImage = '/nodata.gif',
    renderDetailContent,
    onPdfClick,
    hideSidebarHeader = false,
    showSelection = true,
    hideSelection = false
}) => {
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const isDataLoading = loading || isLoading;

    // Sync detail loading state
    useEffect(() => {
        if (selectedItem) {
            setIsDetailLoading(true);
            const timer = setTimeout(() => setIsDetailLoading(false), 500);
            return () => clearTimeout(timer);
        }
    }, [selectedItem?.id]);

    // Automatically select the first item when data finishes loading and no item is selected
    useEffect(() => {
        if (!isDataLoading && data && data.length > 0 && !selectedItem && onSelectItem) {
            onSelectItem(data[0]);
        }
    }, [isDataLoading, data?.length, selectedItem === null, onSelectItem]);

    const handleCardClick = (item) => {
        if (onSelectItem) onSelectItem(item);
    };

    const isItemSelected = (item) => {
        if (type === 'enquiry') {
            if (isAllSelectedAcrossPages) {
                return !excludedEnquiries.includes(item.id);
            }
            return selectedEnquiries.includes(item.id);
        }
        return !!rowSelection[item.id];
    };

    const handleSelectAll = (checked) => {
        if (type === 'enquiry') {
            if (checked) {
                setSelectedEnquiries(data.map(item => item.id));
            } else {
                setSelectedEnquiries([]);
                setIsAllSelectedAcrossPages && setIsAllSelectedAcrossPages(false);
                setExcludedEnquiries && setExcludedEnquiries([]);
            }
        } else {
            const nextSelection = { ...rowSelection };
            data.forEach(item => {
                if (checked) nextSelection[item.id] = true;
                else delete nextSelection[item.id];
            });
            onRowSelectionChange && onRowSelectionChange(nextSelection);
        }
    };

    const handleItemSelection = (e, item) => {
        e.stopPropagation();
        const checked = e.target.checked;
        if (type === 'enquiry') {
            const enquiryId = item.id;
            if (isAllSelectedAcrossPages) {
                if (excludedEnquiries.includes(enquiryId)) {
                    setExcludedEnquiries(excludedEnquiries.filter(id => id !== enquiryId));
                } else {
                    setExcludedEnquiries([...excludedEnquiries, enquiryId]);
                }
            } else {
                if (selectedEnquiries.includes(enquiryId)) {
                    setSelectedEnquiries(selectedEnquiries.filter(id => id !== enquiryId));
                } else {
                    setSelectedEnquiries([...selectedEnquiries, enquiryId]);
                }
            }
        } else {
            const nextSelection = { ...rowSelection };
            if (checked) nextSelection[item.id] = true;
            else delete nextSelection[item.id];
            onRowSelectionChange && onRowSelectionChange(nextSelection);
        }
    };

    const getIcon = (item, size = 18) => {
        if (type === 'physical-appointment') {
            const iconClass = item?.IconClass || item?.iconClass || 'appointment';
            return <AppointmentTypeIcon iconClass={iconClass} size={size} />;
        }

        const customIconPath = item?.iconClass || item?.IconClass;

        if (type === 'followup') {
            if (customIconPath) {
                return renderDynamicIcon(customIconPath, null, size);
            }
            const statusClass = (item.status || item.taskStatus || item._statusClass || '').toLowerCase();
            const iconColor =
                statusClass.includes('overdue') ? '#ef4444' :
                    statusClass.includes('due-today') || statusClass.includes('due today') ? '#22c55e' :
                        (statusClass.includes('scheduled') || statusClass.includes('due in')) ? '#f59e0b' :
                            statusClass.includes('completed') ? '#22c55e' :
                                statusClass.includes('no-followup') ? '#3b82f6' : '#94a3b8';

            return (
                <svg style={{ width: `${size}px`, height: `${size}px`, fill: iconColor }} viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                    <path d="M485.9 696.6c-6.4 0-12.5-3.6-15.6-9.5-29.8-57.6-66.5-62.7-66.9-62.7-9.7-1-16.7-9.5-15.8-19.2 1-9.7 9.5-16.7 19.2-15.8 1.5 0.1 15.9 1.8 34.6 13.2 13.5 8.2 25.8 19.1 36.8 32.7 4.2-14.2 10-30.7 17.9-47.4 28.9-61.5 71-95.4 121.7-98 9.7-0.5 18 7 18.4 16.7 0.5 9.7-7 18-16.7 18.4-37.6 2-68.5 28.1-91.8 77.9-18.5 39.4-24.7 78.6-24.7 78.9-1.2 7.5-7 13.4-14.5 14.7-0.7 0-1.7 0.1-2.6 0.1z m0 0"></path>
                    <path d="M758.2 415.2H265.8c-9.7 0-17.5-7.8-17.5-17.5s7.8-17.5 17.5-17.5h492.5c9.7 0 17.5 7.8 17.5 17.5 0 9.6-7.9 17.5-17.6 17.5z m0 0"></path>
                    <path d="M722.6 214.2h-20.4V169c0-9.7-7.8-17.5-17.5-17.5s-17.5 7.8-17.5 17.5v45.2H356.8V169c0-9.7-7.8-17.5-17.5-17.5s-17.5 7.8-17.5 17.5v45.2h-20.4c-77.3 0-140.2 62.9-140.2 140.3v353.9c0 77.3 62.9 140.2 140.2 140.2h421.2c77.3 0 140.2-62.9 140.2-140.2v-354c0.1-77.3-62.8-140.2-140.2-140.2z m105.2 494.1c0 58-47.1 105.2-105.2 105.2H301.4c-58 0-105.2-47.1-105.2-105.2V354.4c0-58 47.1-105.2 105.2-105.2h20.4v45.2c0 9.7 7.8 17.5 17.5 17.5s17.5-7.8 17.5-17.5v-45.2h310.3v45.2c0 9.7 7.8 17.5 17.5 17.5s17.5-7.8 17.5-17.5v-45.2h20.4c58 0 105.2 47.1 105.2 105.2v353.9z m0 0"></path>
                </svg>
            );
        }

        if (type === 'enquiry') {
            return <User size={size} style={{ color: '#3b82f6' }} />;
        }

        if (type === 'event') {
            return <Calendar size={size} style={{ color: '#3b82f6' }} />;
        }

        // Default Task Icon (Mic SVG as per user's earlier requirement)
        return renderDynamicIcon(customIconPath, (
            <svg xmlns="http://www.w3.org/2000/svg" id="Capa_1" enableBackground="new 0 0 512 512" height={`${size}px`} viewBox="0 0 512 512" width={`${size}px`}>
                <g>
                    <g>
                        <path d="m338.554 452h-164.999c-12.407 0-22.5 10.093-22.5 22.5v37.5h142.5v-15h-127.5v-22.5c0-4.136 3.365-7.5 7.5-7.5h164.999c4.136 0 7.501 3.364 7.501 7.5v22.5h-37.499v15h52.499v-37.5c0-12.407-10.093-22.5-22.501-22.5z" fill="#3b82f6"></path>
                        <path d="m256.055 353.932c45.491 0 82.5-37.009 82.5-82.5v-188.932c0-18.929-6.641-37.454-18.699-52.164l-11.6 9.51c9.865 12.035 15.299 27.183 15.299 42.653h-15v15h15v15h-15v15h15v15h-15v15h15v15h-15v15h15v15h-60.055v15h60.055v53.933c0 37.22-30.28 67.5-67.5 67.5s-67.5-30.28-67.5-67.5v-53.933h59.945v-15h-59.945v-15h44.998v-15h-44.998v-15h44.998v-15h-44.998v-15h44.998v-15h-44.998v-15h44.998v-15h-44.998c0-37.219 30.28-67.5 67.5-67.5 15.471 0 30.62 5.433 42.654 15.299l9.51-11.601c-14.709-12.056-33.235-18.697-52.164-18.697-45.491 0-82.5 37.01-82.5 82.5v188.931c0 45.491 37.009 82.501 82.5 82.501z" fill="#7dd7ff"></path>
                        <path d="m398.555 202.499h-45v15h30v15h-30v15h15v23.934c0 62.033-50.468 112.5-112.5 112.5s-112.5-50.467-112.5-112.5v-23.934h14.89v-15h-30v-15h30v-15h-45v45h15.11v23.934c0 59.973 41.625 110.399 97.5 123.926v41.641h15v-38.955c4.922.579 9.925.887 15 .887s10.079-.307 15-.887v38.955h15v-41.643c55.875-13.527 97.5-63.953 97.5-123.926v-23.934h15z" fill="#7dd7ff"></path>
                        <path d="m226.055 278.933c0 16.542 13.458 30 30 30s30-13.458 30-30-13.458-30-30-30-30 13.458-30 30zm30-15c8.271 0 15 6.729 15 15s-6.729 15-15 15-15-6.729-15-15 6.729-15 15-15z" fill="#7dd7ff"></path>
                        <path d="m248.552 37.501h15v15h-15z" fill="#7dd7ff"></path>
                        <path d="m293.555 232.498h15v15h-15z" fill="#7dd7ff"></path>
                        <path d="m278.555 142.5h15v15h-15z" fill="#7dd7ff"></path>
                        <path d="m278.555 172.499h15v15h-15z" fill="#7dd7ff"></path>
                        <path d="m278.555 112.5h15v15h-15z" fill="#7dd7ff"></path>
                        <path d="m278.555 82.5h15v15h-15z" fill="#7dd7ff"></path>
                    </g>
                </g>
            </svg>
        ), size);
    };


    return (
        <div className="grid-layout-container">
            {/* Left Sidebar - List View */}
            <aside className="grid-sidebar">
                <div className="grid-sidebar-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {!hideSelection && (type === 'task' || type === 'enquiry') && (
                            <Checkbox
                                size="small"
                                icon={<RadioButtonUncheckedIcon />}
                                checkedIcon={<CheckCircleIcon />}
                                sx={{
                                    p: 0,
                                    color: '#cbd5e1',
                                    '&.Mui-checked': { color: '#00897b' }
                                }}
                                indeterminate={
                                    type === 'enquiry' ? (
                                        (selectedEnquiries.length > 0 && selectedEnquiries.length < data.length && !isAllSelectedAcrossPages) ||
                                        (isAllSelectedAcrossPages && excludedEnquiries.length > 0 && excludedEnquiries.length < totalRecords)
                                    ) : (
                                        Object.keys(rowSelection).length > 0 && Object.keys(rowSelection).length < data.length
                                    )
                                }
                                checked={
                                    type === 'enquiry' ? (
                                        (data.length > 0 && selectedEnquiries.length === data.length && !isAllSelectedAcrossPages) ||
                                        (isAllSelectedAcrossPages && data.every(enq => !excludedEnquiries.includes(enq.id)))
                                    ) : (
                                        data.length > 0 && data.every(item => rowSelection[item.id])
                                    )
                                }
                                onChange={(e) => handleSelectAll(e.target.checked)}
                            />
                        )}
                        <span style={{ fontWeight: 700, color: '#334155' }}>
                            {type === 'task' ? 'Task List' : (type === 'event' ? 'Event List' : (type === 'physical-appointment' ? 'Physical Appointment List' : (type === 'followup' ? 'Follow-up List' : (type === 'enquiry' ? 'Enquiry List' : (type === 'conversion' ? 'Conversion List' : 'Appointment List')))))}
                        </span>
                    </div>
                </div>

                <div className="grid-list-scroll">
                    {isDataLoading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <Box key={i} sx={{ p: 2, border: '1px solid #f1f5f9', borderRadius: '12px' }}>
                                <Skeleton variant="text" width="80%" height={24} />
                                <Skeleton variant="text" width="60%" height={20} />
                                <Skeleton variant="circular" width={24} height={24} sx={{ mt: 1 }} />
                            </Box>
                        ))
                    ) : data.length > 0 ? (
                        data.map((item) => (
                            <div
                                key={item.id}
                                className={`grid-card ${selectedItem?.id === item.id ? 'active' : ''}`}
                                onClick={() => handleCardClick(item)}
                            >
                                {!hideSelection && (type === 'task' || type === 'enquiry') && (
                                    <div className="grid-card-selection" onClick={e => e.stopPropagation()}>
                                        <Checkbox
                                            size="small"
                                            icon={<RadioButtonUncheckedIcon />}
                                            checkedIcon={<CheckCircleIcon />}
                                            sx={{
                                                p: 0,
                                                color: '#cbd5e1',
                                                '&.Mui-checked': { color: '#00897b' }
                                            }}
                                            checked={isItemSelected(item)}
                                            onChange={(e) => handleItemSelection(e, item)}
                                        />
                                    </div>
                                )}

                                <div className="grid-card-content">
                                    <div className="grid-card-title-row">
                                        {type !== 'appointment' && (
                                            <div className="sidebar-icon-circle" style={{
                                                background: (type === 'task' || type === 'physical-appointment' || type === 'followup') ? 'transparent' : (['enquiry', 'task', 'appointment', 'physical-appointment', 'followup'].includes(type) ? getAvatarStyle(item.title || item.name || item.personName).bg : '#f0f7ff'),
                                                border: (type === 'task' || type === 'physical-appointment' || type === 'followup') ? 'none' : '1px solid #dbeafe',
                                                width: '36px',
                                                height: '36px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: '50%',
                                                flexShrink: 0
                                            }}>
                                                {(['enquiry', 'appointment'].includes(type) && type !== 'task') ? (
                                                    <span style={{ fontSize: '13px', fontWeight: 800, color: getAvatarStyle(item.title || item.name || item.personName).text }}>
                                                        {getInitials ? getInitials(item.title || item.name || item.personName) : 'U'}
                                                    </span>
                                                ) : getIcon(item, (type === 'task' || type === 'physical-appointment' || type === 'followup') ? 22 : 18)}
                                            </div>
                                        )}
                                        <h4 className="grid-card-title flex items-center gap-2" title={item.taskTitle || item.title}>
                                            {onViewLead && !['task', 'physical-appointment', 'followup', 'appointment'].includes(type) ? (
                                                <span
                                                    className="truncate grid-card-title-link"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onViewLead(item.enquiryId || item.id);
                                                    }}
                                                >
                                                    {(item.taskTitle || item.title || '').replace(/#\d+/, '').trim()}
                                                </span>
                                            ) : (
                                                <span className="truncate">{(item.taskTitle || item.title || '').replace(/#\d+/, '').trim()}</span>
                                            )}
                                            {onPdfClick && (
                                                <FileText
                                                    size={14}
                                                    className="text-red-500 hover:scale-125 transition-transform cursor-pointer flex-shrink-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onPdfClick(item._original || item);
                                                    }}
                                                />
                                            )}
                                        </h4>
                                    </div>

                                    <div className="grid-card-status-row">
                                        {getCompletionBadge ? (
                                            getCompletionBadge(item)
                                        ) : (
                                            <span className={`status-badge-inline ${item._statusClass || 'open'}`}>{item._badgeText || 'OPEN'}</span>
                                        )}
                                        <span className="grid-card-date">
                                            {formatDate ? formatDate(item.date || item.endDate || item.startDate) : (item.date || item.endDate || item.startDate)}
                                        </span>
                                    </div>

                                    <div className="grid-card-related-row">
                                        {type !== 'enquiry' && (
                                            <ScoreCard
                                                leadId={item.enquiryId || item.leadId}
                                                mobileNo={item.phone || item.mobile}
                                                personName={item.name || item.personName}
                                            >
                                                <div
                                                    className="grid-card-avatar"
                                                    style={{
                                                        background: getAvatarStyle(item.name || item.personName).bg,
                                                        color: getAvatarStyle(item.name || item.personName).text,
                                                        fontWeight: 700
                                                    }}
                                                    onClick={(e) => { e.stopPropagation(); onViewLead && onViewLead(item.enquiryId || item.leadId); }}
                                                >
                                                    {getInitials ? getInitials(item.name || item.personName) : 'U'}
                                                </div>
                                            </ScoreCard>
                                        )}
                                        <span className="grid-card-related-name" onClick={(e) => { e.stopPropagation(); onViewLead && onViewLead(item.enquiryId || item.leadId); }}>
                                            {type === 'enquiry' ? (item.phone || item.mobile || '-') : (item.name || item.personName || '-')}
                                        </span>
                                        {type === 'physical-appointment' && item.address && (
                                            <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '2px', marginLeft: '3px' }}>
                                                {item.address}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="grid-empty-state">
                            <img src={emptyImage} alt="No Data" style={{ width: '120px', marginBottom: '16px' }} />
                            <Typography sx={{ fontWeight: 600, fontSize: '14px' }}>No record Found.</Typography>
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="grid-pagination">
                        <button
                            className="page-btn"
                            onClick={() => onPageChange && onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            ‹
                        </button>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                            {currentPage} / {totalPages}
                        </span>
                        <button
                            className="page-btn"
                            onClick={() => onPageChange && onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            ›
                        </button>
                    </div>
                )}
            </aside>

            {/* Right Main Panel - Detailed View */}
            <main className="grid-detail-panel">
                <div className="grid-detail-scroll">
                    {isDataLoading ? (
                        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '20px' }}>
                            <Loader message="Loading list records..." />
                        </div>
                    ) : selectedItem ? (
                        renderDetailContent ? renderDetailContent(selectedItem) : (
                            <UniversalDetailContent
                                id={selectedItem.id}
                                type={type}
                                detailData={selectedItem}
                                userId={localStorage.getItem('userId') || "34594"}
                                onViewLead={onViewLead}
                            />
                        )
                    ) : (
                        <div className="grid-empty-state">
                            <img src={emptyImage} alt={data.length === 0 ? "No Data" : "Select an item"} style={{ width: data.length === 0 ? '180px' : '320px', marginBottom: '24px', opacity: 0.8 }} />
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
                                {data.length === 0 ? "No record Found." : "No record Selected"}
                            </Typography>
                            <Typography sx={{ color: '#64748b' }}>
                                {data.length === 0
                                    ? "We couldn't find any records matching your current filters or search term."
                                    : "Select an item from the list to view its full details and manage activities."}
                            </Typography>
                        </div>
                    )}
                </div>

                {isDetailLoading && (
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(255,255,255,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10
                    }}>
                        <Loader message="Fetching details..." />
                    </div>
                )}
            </main>
        </div>
    );
};

export default GridMainPanelLayout;
