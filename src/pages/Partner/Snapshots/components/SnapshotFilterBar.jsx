import React, { useState, useEffect } from 'react';
import { Input, Button } from 'antd';
import { Search } from 'lucide-react';

const SnapshotFilterBar = ({ search, onSearch }) => {
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const handleSearch = () => {
    onSearch(localSearch);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        allowClear
        prefix={<Search size={15} className="text-gray-400" />}
        placeholder="Search by Name"
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        onPressEnter={handleSearch}
        style={{ width: 240 }}
      />
      <Button
        type="primary"
        icon={<Search size={14} />}
        onClick={handleSearch}
        className="bg-green-600 hover:bg-green-700 border-green-600"
      >
        Search
      </Button>
    </div>
  );
};

export default SnapshotFilterBar;
