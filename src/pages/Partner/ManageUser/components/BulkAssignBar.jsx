import React, { useState } from 'react';
import { Select, Button } from 'antd';
import { Users2 } from 'lucide-react';
import { mockTeamMembers } from '../mockData/mockUsers';

// Replaces the filter toolbar whenever at least one row is checked (legacy rule BT-1).
// Unlike the legacy page (B-17), Save is disabled while the dropdown is still on its
// placeholder - selecting a real team member is required before "Assign Team" can fire.
const BulkAssignBar = ({ selectedCount, onAssign, assigning }) => {
  const [teamMemberId, setTeamMemberId] = useState(null);

  const handleAssign = () => {
    if (!teamMemberId) return;
    onAssign(teamMemberId);
    setTeamMemberId(null);
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700">
        <Users2 size={15} className="text-green-600" />
        {selectedCount} selected
      </span>
      <Select
        placeholder="--Select Team member--"
        style={{ width: 220 }}
        value={teamMemberId}
        onChange={setTeamMemberId}
        options={mockTeamMembers.map((m) => ({ label: m.name, value: m.id }))}
      />
      <Button
        type="primary"
        className="bg-green-600 hover:bg-green-700 border-green-600"
        disabled={!teamMemberId}
        loading={assigning}
        onClick={handleAssign}
      >
        Assign Team
      </Button>
    </div>
  );
};

export default BulkAssignBar;
