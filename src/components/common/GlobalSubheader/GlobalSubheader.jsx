import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { Select, DatePicker, InputNumber, Button } from 'antd';
import './GlobalSubheader.css';

const { Option } = Select;
const { RangePicker } = DatePicker;

const GlobalSubheader = ({ 
  title = "Page Title",
  addLabel = "Add",
  onAddClick,
  searchPlaceholder = "Search...",
  onSearch,
  searchConfig = []
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [searchField, setSearchField] = useState(searchConfig.length > 0 ? searchConfig[0].key : 'all');
  const [numRange, setNumRange] = useState([null, null]);

  const currentFieldConfig = searchConfig.find(c => c.key === searchField);
  const searchType = currentFieldConfig ? currentFieldConfig.type : 'text';

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSearch) {
      triggerSearch();
    }
  };

  const triggerSearch = () => {
    if (onSearch) {
      if (searchType === 'number') {
        onSearch({ field: searchField, type: 'number', min: numRange[0], max: numRange[1] });
      } else if (searchType === 'date') {
        onSearch({ field: searchField, type: 'date', range: searchValue }); // searchValue holds the date objects
      } else {
        onSearch({ field: searchField, type: 'text', value: searchValue });
      }
    }
  };

  const handleFieldChange = (val) => {
    setSearchField(val);
    setSearchValue('');
    setNumRange([null, null]);
  };

  return (
    <header className="premium-subheader">
      
      {/* Left Section: Title */}
      <div className="subheader-title-section">
        <h1>{title}</h1>
      </div>

      {/* Middle Section: Search Bar */}
      <div className="subheader-center-section">
        <div className="subheader-search-wrapper" style={{ paddingLeft: searchConfig.length > 0 ? '0' : '40px' }}>
          {searchConfig.length === 0 && <Search size={20} className="subheader-search-icon" />}
          
          {searchConfig.length > 0 && (
            <Select 
              value={searchField} 
              onChange={handleFieldChange}
              style={{ width: 140, height: '100%' }}
              bordered={false}
              className="subheader-field-select"
              dropdownMatchSelectWidth={false}
              dropdownStyle={{ zIndex: 9999 }}
            >
              {searchConfig.map(config => (
                <Option key={config.key} value={config.key}>{config.label}</Option>
              ))}
            </Select>
          )}

          {searchType === 'text' && (
            <input 
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="subheader-search-input"
              style={searchConfig.length > 0 ? { paddingLeft: '16px', paddingRight: '16px', borderLeft: '1px solid #e2e8f0' } : {}}
            />
          )}

          {searchType === 'number' && (
            <div className="flex items-center gap-2 px-4 flex-1 h-full" style={{ borderLeft: '1px solid #e2e8f0' }}>
              <InputNumber 
                placeholder="Min" 
                value={numRange[0]} 
                onChange={(val) => setNumRange([val, numRange[1]])} 
                onPressEnter={triggerSearch}
                bordered={false}
                style={{ width: '45%' }}
              />
              <span className="text-gray-400">-</span>
              <InputNumber 
                placeholder="Max" 
                value={numRange[1]} 
                onChange={(val) => setNumRange([numRange[0], val])} 
                onPressEnter={triggerSearch}
                bordered={false}
                style={{ width: '45%' }}
              />
            </div>
          )}

          {searchType === 'date' && (
            <div className="flex items-center flex-1 h-full px-2" style={{ borderLeft: '1px solid #e2e8f0' }}>
              <RangePicker 
                bordered={false}
                value={searchValue}
                onChange={(dates) => setSearchValue(dates)}
                className="w-full"
                popupStyle={{ zIndex: 9999 }}
              />
            </div>
          )}

          {searchConfig.length > 0 && (
             <Button type="primary" className="h-full rounded-l-none" onClick={triggerSearch} style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, height: '40px', boxShadow: 'none' }}>
                <Search size={16} />
             </Button>
          )}

        </div>
      </div>

      {/* Right Section: Controls */}
      <div className="subheader-right-section">
        <div className="subheader-actions">
          {onAddClick && (
            <button 
              className="subheader-action-btn primary-add"
              onClick={onAddClick}
              title={addLabel}
            >
              <Plus size={20} />
            </button>
          )}
        </div>
      </div>

    </header>
  );
};

export default GlobalSubheader;
