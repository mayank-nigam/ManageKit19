import React, { useState, useEffect } from 'react';
import { Input, Radio, DatePicker } from 'antd';
import { Search } from 'lucide-react';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const RANGE_PRESETS = {
  'This Week': [dayjs().startOf('week'), dayjs().endOf('week')],
  Today: [dayjs().startOf('day'), dayjs().endOf('day')],
  Yesterday: [dayjs().subtract(1, 'day').startOf('day'), dayjs().subtract(1, 'day').endOf('day')],
  'Last 30 Days': [dayjs().subtract(29, 'day').startOf('day'), dayjs().endOf('day')],
  'This Month': [dayjs().startOf('month'), dayjs().endOf('month')],
  'Last Month': [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')],
};

// Unlike Manage User's live-debounced search, this page's legacy filter bar uses an
// explicit search button (business rules GR-4) - matched faithfully here rather than
// applying the other page's pattern uniformly.
const SegmentFilterBar = ({ filters, onSearch, onDateRangeChange, onStatusChange }) => {
  const [searchText, setSearchText] = useState(filters.nameSearch);

  useEffect(() => {
    setSearchText(filters.nameSearch);
  }, [filters.nameSearch]);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <RangePicker
        value={[dayjs(filters.fromDate), dayjs(filters.toDate)]}
        onChange={(range) => {
          if (range) onDateRangeChange(range[0].format('YYYY-MM-DD'), range[1].format('YYYY-MM-DD'));
        }}
        presets={Object.entries(RANGE_PRESETS).map(([label, value]) => ({ label, value }))}
        format="DD-MMM-YYYY"
      />

      <Input
        placeholder="Search Name"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onPressEnter={() => onSearch(searchText)}
        style={{ width: 220 }}
        suffix={
          <button type="button" onClick={() => onSearch(searchText)} className="text-gray-400 hover:text-gray-600" aria-label="Search">
            <Search size={15} />
          </button>
        }
      />

      <Radio.Group
        value={filters.status}
        onChange={(e) => onStatusChange(e.target.value)}
        optionType="button"
        buttonStyle="solid"
        options={[
          { label: 'All', value: '' },
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
        ]}
      />
    </div>
  );
};

export default SegmentFilterBar;
