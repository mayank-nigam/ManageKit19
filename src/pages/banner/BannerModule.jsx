import React, { useState, useEffect } from 'react';
import { notification, Input, DatePicker, Select } from 'antd';
import { Plus, Edit2, Trash2, Copy } from 'lucide-react';
import dayjs from 'dayjs';
import PremiumTable from '../../components/common/PremiumTable/PremiumTable';
import OverlayWidget from '../../components/common/OverlayWidget/OverlayWidget';
import GlobalSubheader from '../../components/common/GlobalSubheader/GlobalSubheader';
import API_ENDPOINTS from '../../config/apiEndpoints';
import './BannerModule.css';

const NEWV3_BASE_URL = process.env.REACT_APP_SERVICES_API_BASE_URL || 'http://localhost:62194/';
const AZURE_BASE_URL = process.env.REACT_APP_SERVICES_AZURE_BASEURL || 'https://serviceskit19.azurewebsites.net/';
const BANNER_API_URL = `${NEWV3_BASE_URL}${API_ENDPOINTS.BANNER.banner}`;
const USERS_API_URL = `${AZURE_BASE_URL}${API_ENDPOINTS.TICKET_SUPPORT.BIND_USERS}`;
const USER_SEGMENT_API_URL = `${AZURE_BASE_URL}${API_ENDPOINTS.BANNER.GET_USER_SEGMENTS}`;
const API_TOKEN = "-2295521862261168";
const USER_ID = 34594;

const { TextArea } = Input;
const { Option } = Select;

const BannerModule = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentFilter, setCurrentFilter] = useState('all');

  // Form states
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerDescription, setBannerDescription] = useState('');
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs().add(7, 'day'));
  const [applicationCode, setApplicationCode] = useState('');
  const [moduleCode, setModuleCode] = useState('');
  const [users, setUsers] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [userSegments, setUserSegments] = useState([]);
  const [segmentOptions, setSegmentOptions] = useState([]);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchUserOptions = async () => {
    try {
      const payload = {
        Token: API_TOKEN,
        Details: JSON.stringify({ UserId: USER_ID })
      };

      const response = await fetch(USERS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const rawText = await response.text();
        console.log("Raw user API response:", rawText);
        
        let data;
        try {
          data = JSON.parse(rawText);
        } catch(e) {
          console.error("Failed to parse user API JSON", e);
          return;
        }

        let parsed = typeof data === 'string' ? JSON.parse(data) : data;
        let details = parsed.Details;
        
        if (typeof details === 'string') {
          try { details = JSON.parse(details); } catch(e) {}
        }
        
        let usersArr = [];
        
        // Aggressively find an array anywhere in the payload
        if (Array.isArray(parsed)) usersArr = parsed;
        else if (Array.isArray(details)) usersArr = details;
        else if (details && Array.isArray(details.data)) usersArr = details.data;
        else if (details && Array.isArray(details.Data)) usersArr = details.Data;
        else if (details && Array.isArray(details.Table)) usersArr = details.Table;
        else if (parsed.data && Array.isArray(parsed.data)) usersArr = parsed.data;
        else if (parsed.Data && Array.isArray(parsed.Data)) usersArr = parsed.Data;
        else if (parsed.Table && Array.isArray(parsed.Table)) usersArr = parsed.Table;
        
        console.log("Extracted users array:", usersArr);
        setUserOptions(usersArr);
      } else {
        console.error("User API returned status:", response.status);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchUserSegments = async () => {
    try {
      const payload = {
        Token: API_TOKEN,
        LoggedUserId: USER_ID
      };

      const response = await fetch(USER_SEGMENT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        const details = data.Details || [];
        setSegmentOptions(Array.isArray(details) ? details : []);
      } else {
        console.error("User Segments API returned status:", response.status);
      }
    } catch (error) {
      console.error("Error fetching user segments:", error);
    }
  };

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const payload = {
        Token: API_TOKEN,
        Details: JSON.stringify({
          Mode: "GetBanner",
          UserId: USER_ID,
          ApplicationCode: "sales",
          ModuleCode: ""
        })
      };

      const response = await fetch(BANNER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      // The API returns the list in data.Details
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      let bannerList = parsedData.Details || parsedData.Data || parsedData.Table || parsedData || [];
      
      // Sometimes the Details field itself is a stringified JSON array
      if (typeof bannerList === 'string') {
        try {
          bannerList = JSON.parse(bannerList);
        } catch(e) {}
      }

      setBanners(Array.isArray(bannerList) ? bannerList : []);
    } catch (error) {
      console.error(error);
      notification.error({ message: 'Failed to fetch banners' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDrawer = (banner = null) => {
    if (banner) {
      setEditingId(banner.BannerId);
      setBannerTitle(banner.BannerTitle);
      setBannerDescription(banner.BannerDescription);
      setStartDate(dayjs(banner.StartDate));
      setEndDate(dayjs(banner.EndDate));
      setApplicationCode(banner.ApplicationCode || '');
      setModuleCode(banner.ModuleCode || '');
      setUsers(banner.Users ? banner.Users.split(',').filter(Boolean).map(u => Number(u)) : []);
      setUserSegments(banner.UserSegments ? banner.UserSegments.split(',').filter(Boolean).map(u => Number(u)) : []);
    } else {
      setEditingId(null);
      setBannerTitle('');
      setBannerDescription('');
      setStartDate(dayjs());
      setEndDate(dayjs().add(7, 'day'));
      setApplicationCode('');
      setModuleCode('');
      setUsers([]);
      setUserSegments([]);
    }
    setIsDrawerOpen(true);
    fetchUserOptions();
    fetchUserSegments();
  };

  const handleClone = (banner) => {
    setEditingId(null); // Clear editingId so it saves as new
    setBannerTitle(banner.BannerTitle + ' (Copy)');
    setBannerDescription(banner.BannerDescription || '');
    setStartDate(dayjs(banner.StartDate));
    setEndDate(dayjs(banner.EndDate));
    setApplicationCode(banner.ApplicationCode || '');
    setModuleCode(banner.ModuleCode || '');
    setUsers(banner.Users ? banner.Users.split(',').filter(Boolean).map(u => Number(u)) : []);
    setUserSegments(banner.UserSegments ? banner.UserSegments.split(',').filter(Boolean).map(u => Number(u)) : []);
    setIsDrawerOpen(true);
    fetchUserOptions();
    fetchUserSegments();
  };

  const handleSave = async () => {
    if (!bannerTitle || !bannerDescription) {
      notification.warning({ message: 'Title and Description are required' });
      return;
    }

    try {
      let finalUsers = Array.isArray(users) ? [...users] : [];
      if (Array.isArray(userSegments) && userSegments.length > 0) {
        for (const segmentId of userSegments) {
          try {
            const segPayload = {
              Token: API_TOKEN,
              Details: JSON.stringify({
                UserType: 0,
                searchText: "",
                Userid: USER_ID,
                SegmentId: segmentId,
                Offset: 0,
                PageSize: 1000000,
                Draw: 1
              })
            };
            const segRes = await fetch(`${AZURE_BASE_URL}/Partner/LoadPartnerUsersDetail`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(segPayload)
            });
            const segData = await segRes.json();
            if (segData && segData.data && Array.isArray(segData.data)) {
              segData.data.forEach(user => {
                // Ensure we get the ID regardless of exact case
                const id = user.UserId || user.User_ID || user.Id || user.ID || user.userid;
                if (id && !finalUsers.includes(Number(id))) {
                  finalUsers.push(Number(id));
                }
              });
            }
          } catch (segErr) {
            console.error('Failed to load users for segment:', segmentId, segErr);
          }
        }
      }

      const payload = {
        Token: API_TOKEN,
        Details: JSON.stringify({
          Mode: "SaveBanner",
          UserId: USER_ID,
          BannerId: editingId || 0, // 0 usually for new
          BannerTitle: bannerTitle,
          BannerDescription: bannerDescription,
          StartDate: startDate ? startDate.format('YYYY-MM-DD') : "",
          EndDate: endDate ? endDate.format('YYYY-MM-DD') : "",
          ApplicationCode: applicationCode || "sales",
          ModuleCode: moduleCode || "",
          Users: finalUsers.join(','),
          UserSegments: Array.isArray(userSegments) ? userSegments.join(',') : ""
        })
      };

      const response = await fetch(BANNER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      notification.success({ message: 'Banner saved successfully!' });
      setIsDrawerOpen(false);
      fetchBanners();
    } catch (error) {
      console.error(error);
      notification.error({ message: 'Error saving banner' });
    }
  };

  const handleDelete = async (bannerId) => {
    if(window.confirm('Are you sure you want to delete this banner?')) {
      try {
        const payload = {
          Token: API_TOKEN,
          Details: JSON.stringify({
            Mode: "DeleteBanner",
            UserId: USER_ID,
            BannerId: bannerId
          })
        };

        const response = await fetch(BANNER_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        notification.success({ message: 'Banner deleted successfully!' });
        fetchBanners();
      } catch (error) {
        console.error(error);
        notification.error({ message: 'Error deleting banner' });
      }
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'BannerTitle',
      key: 'BannerTitle',
      render: (text) => <span className="font-semibold text-gray-900">{text}</span>,
      width: '20%'
    },
    {
      title: 'Description',
      dataIndex: 'BannerDescription',
      key: 'BannerDescription',
      render: (text) => <span className="text-gray-500 line-clamp-1">{text}</span>,
      width: '25%'
    },
    {
      title: 'Timeline',
      key: 'Timeline',
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
             Start: {record.StartDate}
          </span>
          <span className="text-xs text-red-500 font-semibold flex items-center gap-1">
             End: {record.EndDate}
          </span>
        </div>
      ),
      width: '20%'
    },
    {
      title: 'App / Module',
      key: 'AppModule',
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{record.ApplicationCode}</span>
          <span className="text-xs text-gray-400">{record.ModuleCode || '-'}</span>
        </div>
      ),
      width: '20%'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <button onClick={() => handleOpenDrawer(record)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit">
            <Edit2 size={16} />
          </button>
          <button onClick={() => handleClone(record)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title="Clone">
            <Copy size={16} />
          </button>
          <button onClick={() => handleDelete(record.BannerId)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      ),
      width: '15%'
    }
  ];

  return (
    <div className="flex flex-col h-full w-full bg-white animate-fadeIn" style={{ minHeight: 'calc(100vh - 64px)' }}>
      <GlobalSubheader 
        title="Announcement Banners"
        addLabel="Add Banner"
        onAddClick={() => handleOpenDrawer()}
        searchConfig={[
          { key: 'BannerTitle', label: 'Title', type: 'text' },
          { key: 'BannerId', label: 'Banner ID', type: 'number' },
          { key: 'DateRange', label: 'Date Range', type: 'date' }
        ]}
        onSearch={(searchData) => console.log('Searching banners with', searchData)}
      />

      <div className="flex-1 min-h-0">
        <PremiumTable 
          columns={columns}
          dataSource={banners}
          rowKey="BannerId"
          loading={loading}
          headerFilters={{
            value: currentFilter,
            onChange: setCurrentFilter,
            options: [
              { label: 'All Banners', value: 'all' },
              { label: 'Active', value: 'active' },
              { label: 'Expired', value: 'expired' }
            ]
          }}
        />
      </div>

      <OverlayWidget
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingId ? "Edit Banner" : "Create New Banner"}
        width="w-[500px]"
        footer={
          <>
            <button 
              onClick={() => setIsDrawerOpen(false)}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors shadow-sm"
            >
              Save Banner
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Banner Title</label>
            <Input 
              size="large"
              placeholder="Enter banner title" 
              value={bannerTitle} 
              onChange={(e) => setBannerTitle(e.target.value)} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Banner Description</label>
            <TextArea 
              size="large"
              rows={4}
              placeholder="Describe the banner content..." 
              value={bannerDescription} 
              onChange={(e) => setBannerDescription(e.target.value)} 
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date</label>
              <DatePicker 
                size="large"
                style={{ width: '100%' }}
                value={startDate}
                onChange={(date) => setStartDate(date)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">End Date</label>
              <DatePicker 
                size="large"
                style={{ width: '100%' }}
                value={endDate}
                onChange={(date) => setEndDate(date)}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Application Code</label>
              <Input 
                size="large"
                placeholder="e.g., SALES" 
                value={applicationCode} 
                onChange={(e) => setApplicationCode(e.target.value)} 
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Module Code</label>
              <Input 
                size="large"
                placeholder="e.g., CRM" 
                value={moduleCode} 
                onChange={(e) => setModuleCode(e.target.value)} 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Target Users</label>
            <Select
              mode="multiple"
              size="large"
              placeholder="Select target users"
              style={{ width: '100%' }}
              dropdownStyle={{ zIndex: 10000 }}
              value={users}
              onChange={(values) => setUsers(values)}
              optionFilterProp="children"
              showSearch
            >
              {userOptions.map(user => (
                <Option key={user.User_ID} value={user.User_ID}>
                  {user.Name}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Target Segments</label>
            <Select
              mode="multiple"
              size="large"
              placeholder="Select target user segments"
              style={{ width: '100%' }}
              dropdownStyle={{ zIndex: 10000 }}
              value={userSegments}
              onChange={(values) => setUserSegments(values)}
              optionFilterProp="children"
              showSearch
            >
              {segmentOptions.map(seg => (
                <Option key={seg.Id} value={seg.Id}>
                  {seg.SegmentName}
                </Option>
              ))}
            </Select>
          </div>
        </div>
      </OverlayWidget>
    </div>
  );
};

export default BannerModule;
