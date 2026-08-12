import React, { useState, useEffect } from 'react';
import { notification, Input, Select, Switch } from 'antd';
import { Plus, Edit2, Trash2, Eye, EyeOff, Upload, Download } from 'lucide-react';
import ReactQuill from 'react-quill-new';

import 'react-quill-new/dist/quill.snow.css';
import PremiumTable from '../../components/common/PremiumTable/PremiumTable';
import OverlayWidget from '../../components/common/OverlayWidget/OverlayWidget';
import GlobalSubheader from '../../components/common/GlobalSubheader/GlobalSubheader';
import API_ENDPOINTS from '../../config/apiEndpoints';
import './HelpModule.css';

// const NEWV3_BASE_URL = process.env.REACT_APP_SERVICES_API_BASE_URL || 'http://localhost:62194/';
const NEWV3_BASE_URL = process.env.REACT_APP_SERVICES_API_BASE_URL || 'http://localhost:62194/';
const HELP_API_URL = `${NEWV3_BASE_URL}${API_ENDPOINTS.BANNER.banner}`;
const API_TOKEN = "-2295521862261168";
const USER_ID = 34594;

const { TextArea } = Input;
const { Option } = Select;

const moduleOptions = [
  { name: "Revenue", code: "PAG10224" },
  { name: "Invoices", code: "PAG10223" },
  { name: "Quotations", code: "PAG10222" },
  { name: "Lead Activities", code: "PAG10037" },
  { name: "Pipeline Deal", code: "PAG10038" },
  { name: "Pipeline History", code: "PAG10307" },
  { name: "Call List", code: "PAG10381" },
  { name: "Create Event", code: "PAG10333" },
  { name: "Webook Events", code: "PAG10332" },
  { name: "Credit Note", code: "PAG10384" },
  { name: "Customer Ledger", code: "PAG10274" },
  { name: "Conversions", code: "PAG10033" },
  { name: "Leads", code: "PAG10031" },
  { name: "Segmentation", code: "PAG10036" },
  { name: "Merge Duplicate Enquiry", code: "PAG10305" },
  { name: "Follow-ups", code: "PAG10039" },
  { name: "Enquiries", code: "PAG10002" },
  { name: "Tasks", code: "PAG10034" },
  { name: "Appointments", code: "PAG10035" }
];

const HelpModule = () => {
  const [helpContents, setHelpContents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedModuleFilter, setSelectedModuleFilter] = useState(moduleOptions[0].code);

  // Form states
  const [currentPage, setCurrentPage] = useState('');
  const [isActive, setIsActive] = useState(1);
  const [qaList, setQaList] = useState([{ Title: '', Description: '', VideoUrl: '' }]);
  const [applicationCode, setApplicationCode] = useState('SALES');
  const [users, setUsers] = useState([]);
  const [userOptions, setUserOptions] = useState([]);

  useEffect(() => {
    fetchHelpContent();
  }, [selectedModuleFilter]);

  const fetchUserOptions = async () => {
    try {
      const payload = {
        Token: API_TOKEN,
        Details: JSON.stringify({ Mode: "UserList", UserId: USER_ID })
      };

      const response = await fetch(HELP_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const rawText = await response.text();
        let data;
        try { data = JSON.parse(rawText); } catch(e) { return; }

        let parsed = typeof data === 'string' ? JSON.parse(data) : data;
        let details = parsed.Details;
        if (typeof details === 'string') {
          try { details = JSON.parse(details); } catch(e) {}
        }
        
        let usersArr = [];
        if (Array.isArray(parsed)) usersArr = parsed;
        else if (Array.isArray(details)) usersArr = details;
        else if (details && Array.isArray(details.data)) usersArr = details.data;
        else if (details && Array.isArray(details.Data)) usersArr = details.Data;
        else if (details && Array.isArray(details.Table)) usersArr = details.Table;
        else if (parsed.data && Array.isArray(parsed.data)) usersArr = parsed.data;
        else if (parsed.Data && Array.isArray(parsed.Data)) usersArr = parsed.Data;
        else if (parsed.Table && Array.isArray(parsed.Table)) usersArr = parsed.Table;
        
        setUserOptions(usersArr);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchHelpContent = async () => {
    setLoading(true);
    try {
      const payload = {
        Token: API_TOKEN,
        Details: JSON.stringify({
          Mode: "GetHelpContent",
          UserId: USER_ID,
          CurrentPage: selectedModuleFilter,
          ModuleCode: "",
          PageCode: ""
        })
      };

      const response = await fetch(HELP_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      let helpList = parsedData.Details || parsedData.Data || parsedData.Table || parsedData || [];
      if (typeof helpList === 'string') {
        try { helpList = JSON.parse(helpList); } catch(e) {}
      }

      if (Array.isArray(helpList)) {
        helpList = helpList.map((h, i) => {
          let parsedJson = [];
          try {
            parsedJson = typeof h.JsonResult === 'string' ? JSON.parse(h.JsonResult) : (h.JsonResult || []);
            // Normalize q/a to Title/Description if they exist
            parsedJson = parsedJson.map(item => ({
              ...item,
              Title: item.Title || item.title || item.q || '',
              Description: item.Description || item.description || item.a || '',
              IsHidden: !!item.IsHidden
            }));
          } catch (e) {
            console.error('Error parsing JsonResult:', e);
          }
          return { 
            ...h, 
            HelpId: h.HelpId || i,
            CurrentPage: h.CurrentPage || selectedModuleFilter,
            JsonContent: parsedJson
          };
        });
      }

      setHelpContents(Array.isArray(helpList) ? helpList : []);
    } catch (error) {
      console.error(error);
      notification.error({ message: 'Failed to fetch help content' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDrawer = (helpItem = null) => {
    if (helpItem) {
      setEditingId(helpItem.HelpId || 'edit');
      setCurrentPage(helpItem.CurrentPage || '');
      setIsActive(helpItem.IsActive !== undefined ? helpItem.IsActive : 1);
      setQaList(helpItem.JsonContent && helpItem.JsonContent.length > 0 ? [...helpItem.JsonContent] : [{ Title: '', Description: '', VideoUrl: '', IsHidden: false }]);
      setApplicationCode(helpItem.ApplicationCode || 'SALES');
      setUsers(helpItem.Users ? helpItem.Users.split(',').filter(Boolean).map(u => Number(u)) : []);
    } else {
      setEditingId(null);
      setCurrentPage(selectedModuleFilter);
      setIsActive(1);
      setQaList([{ Title: '', Description: '', VideoUrl: '', IsHidden: false }]);
      setApplicationCode('SALES');
      setUsers([]);
    }
    setIsDrawerOpen(true);
    fetchUserOptions();
  };

  const handleAddQuestion = () => {
    setQaList([...qaList, { Title: '', Description: '', VideoUrl: '', IsHidden: false }]);
  };

  const handleRemoveQuestion = (index) => {
    const newList = [...qaList];
    newList.splice(index, 1);
    setQaList(newList);
  };

  const handleToggleHide = (index) => {
    const newList = [...qaList];
    newList[index].IsHidden = !newList[index].IsHidden;
    setQaList(newList);
  };

  const handleQaChange = (index, field, value) => {
    const newList = [...qaList];
    newList[index][field] = value;
    setQaList(newList);
  };

  const handleDownloadTemplate = () => {
    const csvContent = "Title,Description\n\"How to use this feature?\",\"Here is a detailed explanation...\"\n\"What is the next step?\",\"Simply click the button...\"";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "help_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvData = event.target.result;
      
      // Robust CSV parser that handles commas inside quotes
      const parseCSV = (text) => {
        const rows = [];
        let currentRow = [];
        let currentCell = '';
        let inQuotes = false;
        
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          if (char === '"') {
            if (inQuotes && text[i + 1] === '"') {
              currentCell += '"'; // escaped quote
              i++;
            } else {
              inQuotes = !inQuotes; // toggle quotes
            }
          } else if (char === ',' && !inQuotes) {
            currentRow.push(currentCell);
            currentCell = '';
          } else if (char === '\n' && !inQuotes) {
            currentRow.push(currentCell);
            rows.push(currentRow);
            currentRow = [];
            currentCell = '';
          } else if (char !== '\r') {
            currentCell += char;
          }
        }
        if (currentCell || currentRow.length > 0) {
          currentRow.push(currentCell);
          rows.push(currentRow);
        }
        return rows;
      };

      const parsedRows = parseCSV(csvData).filter(row => row.length > 0 && row.some(cell => cell.trim()));
      
      const importedQAs = [];
      let startIdx = 0;
      if (parsedRows.length > 0 && parsedRows[0][0] && parsedRows[0][0].toLowerCase().includes('title')) {
        startIdx = 1; // Skip header row
      }

      for (let i = startIdx; i < parsedRows.length; i++) {
        const row = parsedRows[i];
        if (row.length >= 2) {
          const title = row[0] ? row[0].trim() : '';
          const desc = row[1] ? row[1].trim() : '';
          if (title && desc) {
            importedQAs.push({ Title: title, Description: desc, VideoUrl: '', IsHidden: false });
          }
        }
      }

      if (importedQAs.length > 0) {
        // Strip out empty Q&As from the current list (e.g., the default empty one)
        const currentQAs = qaList.filter(qa => {
          const hasTitle = qa.Title && qa.Title.trim() !== '';
          const strippedDesc = (qa.Description || '').replace(/<[^>]*>?/gm, '').trim();
          const hasDesc = strippedDesc !== '' && strippedDesc !== '<br>';
          return hasTitle || hasDesc;
        });
        
        setQaList([...currentQAs, ...importedQAs]);
        notification.success({ message: `Imported ${importedQAs.length} Q&As` });
      } else {
        notification.warning({ message: 'No valid Q&As found in CSV' });
      }
    };
    reader.readAsText(file);
    e.target.value = null; // reset input
  };

  const handleSave = async () => {
    if (!currentPage) {
      notification.warning({ message: 'Current Page is required' });
      return;
    }

    const validQaList = qaList.filter(qa => qa.Title.trim() && qa.Description.trim());
    if (validQaList.length === 0) {
      notification.warning({ message: 'At least one Title and Description is required' });
      return;
    }

    try {
      let finalUsers = Array.isArray(users) ? [...users] : [];

      const payload = {
        Token: API_TOKEN,
        Details: JSON.stringify({
          Mode: "SaveHelpContent",
          UserId: USER_ID,
          CurrentPage: currentPage,
          ApplicationCode: applicationCode || "SALES",
          Users: finalUsers.join(','),
          JsonContent: validQaList
        })
      };

      const response = await fetch(HELP_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Network response was not ok');

      notification.success({ message: 'Help content saved successfully!' });
      setIsDrawerOpen(false);
      fetchHelpContent();
    } catch (error) {
      console.error(error);
      notification.error({ message: 'Error saving help content' });
    }
  };

  const handleDelete = async (pageCode) => {
    if(window.confirm('Are you sure you want to delete this help content?')) {
      try {
        const payload = {
          Token: API_TOKEN,
          Details: JSON.stringify({
            Mode: "DeleteHelpContent",
            UserId: USER_ID,
            CurrentPage: pageCode
          })
        };

        const response = await fetch(HELP_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Network response was not ok');

        notification.success({ message: 'Help content deleted successfully!' });
        fetchHelpContent();
      } catch (error) {
        console.error(error);
        notification.error({ message: 'Error deleting help content' });
      }
    }
  };

  const columns = [
    {
      title: 'Current Page',
      dataIndex: 'CurrentPage',
      key: 'CurrentPage',
      render: (text) => {
        const mod = moduleOptions.find(m => m.code === text);
        return <span className="font-semibold text-gray-800">{mod ? mod.name : text}</span>;
      },
      width: '20%'
    },
    {
      title: 'Content Items',
      key: 'QuestionsCount',
      width: '20%',
      render: (_, record) => (
        <span className="px-2.5 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-semibold border border-purple-100">
          {record.JsonContent ? record.JsonContent.length : 0} Items
        </span>
      )
    },
    {
      title: 'Content Preview',
      key: 'QuestionPreview',
      width: '45%',
      render: (_, record) => {
        if (!record.JsonContent || record.JsonContent.length === 0) {
          return <span className="text-sm text-gray-500 italic">None</span>;
        }
        return (
          <div className="flex flex-col gap-3">
            {record.JsonContent.map((item, idx) => (
              <div key={idx} className="flex flex-col">
                <span className="text-sm font-semibold text-gray-800 line-clamp-1">
                  {item.IsHidden && <EyeOff size={14} className="inline mr-1 text-gray-400" />}
                  {idx + 1}. {item.Title || 'Untitled Question'}
                </span>
                <span className="text-xs text-gray-500 line-clamp-1 ml-4" dangerouslySetInnerHTML={{ __html: item.Description || '' }}></span>
              </div>
            ))}
          </div>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '10%',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <button onClick={() => handleOpenDrawer(record)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors">
            <Edit2 size={16} />
          </button>
          <button onClick={() => handleDelete(record.CurrentPage)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col h-full w-full bg-white animate-fadeIn" style={{ minHeight: 'calc(100vh - 64px)' }}>
      <GlobalSubheader 
        title="Help Center Content"
        addLabel="Add Help Content"
        onAddClick={() => handleOpenDrawer()}
        searchConfig={[
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'category', label: 'Category', type: 'text' },
          { key: 'views', label: 'Views', type: 'number' }
        ]}
        onSearch={(searchData) => console.log('Searching help with', searchData)}
      />

      <div className="px-6 py-4 border-b border-gray-100 flex items-center bg-gray-50/50">
        <label className="text-sm font-semibold text-gray-700 mr-3">Filter by Page:</label>
        <Select
          style={{ width: 250 }}
          value={selectedModuleFilter}
          onChange={(value) => setSelectedModuleFilter(value)}
          showSearch
          optionFilterProp="children"
        >
          {moduleOptions.map(mod => (
            <Option key={mod.code} value={mod.code}>
              {mod.name} ({mod.code})
            </Option>
          ))}
        </Select>
      </div>

      <div className="flex-1 min-h-0">
        <PremiumTable 
          columns={columns}
          dataSource={helpContents}
          rowKey="HelpId"
          loading={loading}
        />
      </div>

      <OverlayWidget
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingId ? "Edit Help Content" : "Create New Help Content"}
        width="w-[600px]"
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
              Save Help
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Current Page</label>
              <Select 
                size="large"
                style={{ width: '100%' }}
                dropdownStyle={{ zIndex: 10000 }}
                placeholder="Select Page" 
                value={currentPage} 
                onChange={(value) => setCurrentPage(value)}
                showSearch
                optionFilterProp="children"
                disabled={!!editingId}
              >
                <Option value="">All Pages</Option>
                {moduleOptions.map(mod => (
                  <Option key={mod.code} value={mod.code}>
                    {mod.name} ({mod.code})
                  </Option>
                ))}
              </Select>
            </div>
          </div>
          
          <div className="flex gap-4 mt-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">App Code</label>
              <Select 
                size="large"
                style={{ width: '100%' }}
                dropdownStyle={{ zIndex: 10000 }}
                placeholder="Select App Code" 
                value={applicationCode} 
                onChange={(value) => setApplicationCode(value)} 
              >
                <Option value="SALES">SALES</Option>
                <Option value="AI">AI</Option>
                <Option value="WHATSAPP">WHATSAPP</Option>
                <Option value="LOCATION">LOCATION</Option>
                <Option value="HR">HR</Option>
                <Option value="LEADERBOARD">LEADERBOARD</Option>
                <Option value="ALL">ALL</Option>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Allowed Users (Optional)</label>
              <Select 
                mode="multiple"
                size="large"
                style={{ width: '100%' }}
                dropdownStyle={{ zIndex: 10000 }}
                placeholder="All Users (Leave empty)"
                value={users}
                onChange={setUsers}
                filterOption={(input, option) => {
                  const children = option?.children;
                  const text = Array.isArray(children) ? children.join('') : String(children || '');
                  return text.toLowerCase().includes(input.toLowerCase());
                }}
              >
                {userOptions.map(u => {
                  const userName = u.Name || u.UserName || u.Title || 'Unknown User';
                  const userId = u.ID || u.UserId || u.User_ID;
                  return (
                    <Option key={userId} value={userId}>
                      {userName} (ID: {userId})
                    </Option>
                  );
                })}
              </Select>
            </div>
          </div>
          
          <div className="mt-8 border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Questions & Answers</h3>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-1 text-sm font-semibold text-gray-600 bg-white px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <Download size={14} /> Template
                </button>
                <label className="cursor-pointer flex items-center gap-1 text-sm font-semibold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <Upload size={14} /> Import CSV
                  <input type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
                </label>
                <button 
                  onClick={handleAddQuestion}
                  className="flex items-center gap-1 text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
                >
                  <Plus size={14} /> Add Q&A
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {qaList.map((qa, index) => (
                <div key={index} className={`p-4 rounded-xl border relative group transition-colors ${qa.IsHidden ? 'bg-gray-100 border-gray-200 opacity-70' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Q&A #{index + 1} {qa.IsHidden ? '(Hidden)' : ''}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 mr-4 bg-white px-2 py-1 rounded-md border border-gray-200">
                        <span className="text-xs font-semibold text-gray-500">Hide:</span>
                        <Switch 
                          size="small" 
                          checked={!!qa.IsHidden} 
                          onChange={() => handleToggleHide(index)} 
                        />
                      </div>
                      {qaList.length > 1 && (
                        <button 
                          onClick={() => handleRemoveQuestion(index)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                          title="Remove Question"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Title</label>
                      <Input 
                        placeholder="e.g., How to use Tasks" 
                        value={qa.Title} 
                        onChange={(e) => handleQaChange(index, 'Title', e.target.value)} 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Description (Rich Text)</label>
                      <div className="bg-white">
                        <ReactQuill 
                          theme="snow"
                          value={qa.Description} 
                          onChange={(content) => handleQaChange(index, 'Description', content)}
                          style={{ height: '150px', marginBottom: '40px' }}
                          modules={{
                            toolbar: [
                              [{ 'header': [1, 2, 3, false] }],
                              ['bold', 'italic', 'underline', 'strike'],
                              [{ 'color': [] }, { 'background': [] }],
                              ['link', 'image', 'video'],
                              ['clean']
                            ]
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Video URL (Optional)</label>
                      <Input 
                        placeholder="https://youtube.com/example" 
                        value={qa.VideoUrl} 
                        onChange={(e) => handleQaChange(index, 'VideoUrl', e.target.value)} 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </OverlayWidget>
    </div>
  );
};

export default HelpModule;
