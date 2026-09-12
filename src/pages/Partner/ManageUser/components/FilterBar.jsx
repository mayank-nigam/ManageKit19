import React, { useState, useEffect, useRef } from 'react';
import { Input, Select, Radio } from 'antd';
import { Search } from 'lucide-react';
import { mockSegments, USER_TYPE, PARTNER_TYPE } from '../mockData/mockUsers';

const USER_TYPE_OPTIONS = [
  { label: 'All', value: 0 },
  { label: 'User', value: USER_TYPE.USER },
  { label: 'Sub Partner', value: USER_TYPE.SUB_PARTNER },
  { label: 'Bronze Partner', value: `partner-${PARTNER_TYPE.BRONZE}` },
  { label: 'Silver Partner', value: `partner-${PARTNER_TYPE.SILVER}` },
  { label: 'Gold Partner', value: `partner-${PARTNER_TYPE.GOLD}` },
];

// TODO: once a real logged-in-partner session/context exists, filter this option list by
// the partner's own tier (a Bronze partner should not see Silver/Gold options, per the
// legacy tier-visibility rule) - showing the full set for now since there's no real
// session tier to key off of in the mock-data phase.
const FilterBar = ({ filters, onNameSearch, onSegmentChange, onUserTypeChange }) => {
  const [localSearch, setLocalSearch] = useState(filters.nameSearch);
  const debounceRef = useRef(null);

  useEffect(() => {
    setLocalSearch(filters.nameSearch);
  }, [filters.nameSearch]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onNameSearch(value), 300);
  };

  const radioValue = filters.partnerType
    ? `partner-${filters.partnerType}`
    : filters.userType || 0;

  const handleRadioChange = (e) => {
    const value = e.target.value;
    if (typeof value === 'string' && value.startsWith('partner-')) {
      onUserTypeChange({ userType: USER_TYPE.PARTNER, partnerType: Number(value.split('-')[1]) });
    } else {
      onUserTypeChange({ userType: value, partnerType: null });
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Input
        allowClear
        prefix={<Search size={15} className="text-gray-400" />}
        placeholder="Search by User Name"
        value={localSearch}
        onChange={handleSearchChange}
        className="premium-input"
        style={{ width: 240 }}
      />
      <Select
        allowClear
        placeholder="Select User Segment"
        style={{ width: 200 }}
        value={filters.segmentId || undefined}
        onChange={(value) => onSegmentChange(value || null)}
        options={mockSegments.map((s) => ({ label: s.name, value: s.id }))}
      />
      <Radio.Group
        value={radioValue}
        onChange={handleRadioChange}
        options={USER_TYPE_OPTIONS}
        optionType="button"
        buttonStyle="solid"
      />
    </div>
  );
};

export default FilterBar;
