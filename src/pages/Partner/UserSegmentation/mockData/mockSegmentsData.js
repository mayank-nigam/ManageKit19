import dayjs from 'dayjs';

// Mock data for the User Segmentation page.
//
// The grid's default filter is the current calendar month (business rules GR-2/GR-5),
// so mock createdOn dates are computed relative to "today" rather than hardcoded past
// dates - otherwise the page would show "No segments found" out of the box until a
// viewer manually widened the date range, which isn't representative of real usage.
const today = dayjs();
const dateStr = (offsetDays) => today.subtract(offsetDays, 'day').format('YYYY-MM-DD');

// Field list a real backend would return from BannerSetting/GetUserSegmentColumnsList
// (business rules CB-3) - server-driven per partner/account, cached client-side.
export const mockFields = [
  { name: 'UserName', label: 'User Name', dataType: 'VARCHAR' },
  { name: 'CompanyName', label: 'Company Name', dataType: 'VARCHAR' },
  { name: 'City', label: 'City', dataType: 'VARCHAR' },
  { name: 'Country', label: 'Country', dataType: 'VARCHAR' },
  { name: 'CreatedOn', label: 'Created On', dataType: 'DATETIME' },
  { name: 'TotalUsers', label: 'Total Users', dataType: 'INT' },
  { name: 'WalletBalance', label: 'Wallet Balance', dataType: 'BIGINT' },
];

// Same three segments used by the Manage User page's Segment filter dropdown -
// per the business rules (§9 cross-reference), both pages are meant to share one
// list of segments. Kept as an independent mock copy for now (values match by
// convention rather than a shared import) since this is still the mock-data phase;
// once wired to the real BannerSetting/* endpoints both pages will read the same
// server list naturally.
let idSeq = 1;
const nextId = () => idSeq++;

export const mockSegments = [
  {
    id: nextId(),
    name: 'Enterprise',
    createdOn: dateStr(3),
    createdByName: 'Priya Verma',
    status: 'Active',
    logicalOperator: 'and',
    conditions: [
      { fieldName: 'CompanyName', fieldLabel: 'Company Name', operatorValue: 'contain', operatorLabel: 'Contain', value: 'Inc' },
      { fieldName: 'TotalUsers', fieldLabel: 'Total Users', operatorValue: 'gte', operatorLabel: 'Greater Than or Equal (>=)', value: '20' },
    ],
    recordCount: 128,
  },
  {
    id: nextId(),
    name: 'SMB',
    createdOn: dateStr(8),
    createdByName: 'Aman Gupta',
    status: 'Active',
    logicalOperator: 'or',
    conditions: [
      { fieldName: 'City', fieldLabel: 'City', operatorValue: 'equal', operatorLabel: 'Equal To', value: 'Mumbai' },
      { fieldName: 'City', fieldLabel: 'City', operatorValue: 'equal', operatorLabel: 'Equal To', value: 'Pune' },
    ],
    recordCount: 46,
  },
  {
    id: nextId(),
    name: 'Startup',
    createdOn: dateStr(9),
    createdByName: 'Sneha Rao',
    status: 'Inactive',
    logicalOperator: 'and',
    conditions: [
      { fieldName: 'TotalUsers', fieldLabel: 'Total Users', operatorValue: 'lte', operatorLabel: 'Less Than or Equal (<=)', value: '5' },
    ],
    recordCount: 12,
  },
];
