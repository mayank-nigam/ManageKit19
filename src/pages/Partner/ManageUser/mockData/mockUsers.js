// Mock data for the Manage User (Partner) page.
// UserType: 0/1 = User, 2 = Sub Partner, 3/4 = Partner
// PartnerType (only meaningful when userType is 3/4): 1 = Bronze, 2 = Silver, 3 = Gold
// isWhiteLabeled: true = "White Labeled Partner" (branding rights), false = "Non White Labeled Partner"

export const USER_TYPE = {
  USER: 1,
  SUB_PARTNER: 2,
  PARTNER: 4,
};

export const PARTNER_TYPE = {
  BRONZE: 1,
  SILVER: 2,
  GOLD: 3,
};

export const PARTNER_TYPE_LABEL = {
  [PARTNER_TYPE.BRONZE]: 'Bronze Partner',
  [PARTNER_TYPE.SILVER]: 'Silver Partner',
  [PARTNER_TYPE.GOLD]: 'Gold Partner',
};

let idSeq = 1000;
const nextId = () => ++idSeq;

const baseUsers = [
  { name: '12shoppycomputer (Vikas Kumar)', userType: 1, partnerType: null, isWhiteLabeled: false, isDomainVerified: false, mobile: '9810866417', email: '12vikas.kumar@example.com', allowUserCount: 0, totalActiveUser: 1, subscription: { startDate: '2026-07-03', endDate: '2026-09-03' }, assignedTo: '', smsBalance: 0, mailBalance: 0, walletBalance: 0, segmentId: 1, status: 1 },
  { name: '1itsvikas (Vikas Kumar)', userType: 1, partnerType: null, isWhiteLabeled: false, isDomainVerified: false, mobile: '7053553901', email: '2its.me.viku@gmail.com', allowUserCount: 0, totalActiveUser: 1, subscription: { startDate: '2026-03-19', endDate: '2026-04-03' }, assignedTo: '', smsBalance: 0, mailBalance: 0, walletBalance: 0, segmentId: 2, status: 1 },
  { name: 'Abhi015454 (DJ Giri)', userType: 4, partnerType: 3, isWhiteLabeled: true, isDomainVerified: true, mobile: '7809987675', email: 'djay9973@gmail.com', allowUserCount: 25, totalActiveUser: 18, subscription: { startDate: '2026-07-03', endDate: '2026-08-03' }, assignedTo: '', smsBalance: 152300, mailBalance: 0, walletBalance: 10000, segmentId: 1, status: 1 },
  { name: 'Abhi01657 (Abfhd Gf)', userType: 2, partnerType: null, isWhiteLabeled: false, isDomainVerified: false, mobile: '7898098971', email: 'testjay@gmail.com', allowUserCount: 0, totalActiveUser: 4, subscription: { startDate: '2025-08-09', endDate: '2025-08-24' }, assignedTo: '32222-test04 (Test 04)', smsBalance: 10000, mailBalance: 0, walletBalance: 0, segmentId: 2, status: 1 },
  { name: 'Afriksuser (Afrika User)', userType: 1, partnerType: null, isWhiteLabeled: false, isDomainVerified: false, mobile: '785609789', email: 'Afrikauser@gmail.com', allowUserCount: 0, totalActiveUser: 1, subscription: { startDate: '2025-09-03', endDate: '2025-09-18' }, assignedTo: '', smsBalance: 0, mailBalance: 0, walletBalance: 0, segmentId: 3, status: 1 },
  { name: 'ashu24 (Ashutosh Rao)', userType: 1, partnerType: null, isWhiteLabeled: false, isDomainVerified: false, mobile: '9990674258', email: 'ashur4745@example.com', allowUserCount: 0, totalActiveUser: 1, subscription: { startDate: '2026-07-03', endDate: '2026-09-03' }, assignedTo: 'Abhi01 (Abhishek Kumar)', smsBalance: 0, mailBalance: 0, walletBalance: 0, segmentId: 1, status: 1 },
  { name: 'gf6576 (HG768 VB7667)', userType: 1, partnerType: null, isWhiteLabeled: false, isDomainVerified: false, mobile: '7877777098', email: 'hglkjkl89@gmail.com', allowUserCount: 0, totalActiveUser: 1, subscription: { startDate: '2026-04-08', endDate: '2026-04-23' }, assignedTo: '', smsBalance: 0, mailBalance: 0, walletBalance: 0, segmentId: 2, status: 1 },
  { name: 'gfhfg65 (Hfghg Hjhkh6)', userType: 1, partnerType: null, isWhiteLabeled: false, isDomainVerified: false, mobile: '7898000000', email: 'fhj878@gmail.com', allowUserCount: 0, totalActiveUser: 1, subscription: { startDate: '2026-04-08', endDate: '2026-04-23' }, assignedTo: '', smsBalance: 0, mailBalance: 0, walletBalance: 0, segmentId: 3, status: 1 },
  { name: 'gfhgf76980 (Gfhg Jjhgjh)', userType: 1, partnerType: null, isWhiteLabeled: false, isDomainVerified: false, mobile: '7898999999', email: 'kljkj8989@gmail.com', allowUserCount: 0, totalActiveUser: 1, subscription: { startDate: '2026-04-08', endDate: '2026-04-23' }, assignedTo: '', smsBalance: 0, mailBalance: 0, walletBalance: 0, segmentId: 1, status: 1 },
  { name: 'just12 (Justin Bam)', userType: 1, partnerType: null, isWhiteLabeled: false, isDomainVerified: false, mobile: '9780123345', email: 'gfg65@gmail.com', allowUserCount: 0, totalActiveUser: 1, subscription: { startDate: '2026-04-09', endDate: '2026-04-24' }, assignedTo: '', smsBalance: 0, mailBalance: 0, walletBalance: 0, segmentId: 2, status: 1 },
  { name: 'user1 (Southafrica Partner)', userType: 4, partnerType: 1, isWhiteLabeled: false, isDomainVerified: false, mobile: '834790934', email: 'southafricapartner@example.com', allowUserCount: 0, totalActiveUser: 1, subscription: { startDate: '2025-09-02', endDate: '2025-09-17' }, assignedTo: '', smsBalance: 5, mailBalance: 10, walletBalance: 15, segmentId: 3, status: 1 },
  { name: 'test256 (Test 256)', userType: 4, partnerType: 2, isWhiteLabeled: false, isDomainVerified: false, mobile: '7878233432', email: 'test256@gmail.com', allowUserCount: 0, totalActiveUser: 1, subscription: { startDate: '2025-09-03', endDate: '2025-09-18' }, assignedTo: '', smsBalance: 0, mailBalance: 0, walletBalance: 0, segmentId: 1, status: 1 },
  { name: 'test255 (Test 255)', userType: 4, partnerType: 3, isWhiteLabeled: true, isDomainVerified: false, mobile: '9999999989', email: 'test255@gmail.com', allowUserCount: 0, totalActiveUser: 1, subscription: { startDate: '2025-09-02', endDate: '2025-09-17' }, assignedTo: '', smsBalance: 0, mailBalance: 0, walletBalance: 0, segmentId: 2, status: 1 },
  { name: 'Newsouthuser (New South User)', userType: 1, partnerType: null, isWhiteLabeled: false, isDomainVerified: false, mobile: '789878987', email: 'newsouthuser@example.com', allowUserCount: 0, totalActiveUser: 1, subscription: { startDate: '2025-09-03', endDate: '2025-09-18' }, assignedTo: '', smsBalance: 0, mailBalance: 0, walletBalance: 0, segmentId: 3, status: 0 },
];

export const mockUsers = baseUsers.map(({ mobile, ...rest }) => ({
  id: nextId(),
  avatarUrl: null,
  ...rest,
  // Spread last: `rest.mobile` would otherwise be absent (destructured out above)
  // specifically so this structured object always wins over the raw string field
  // baseUsers stores mobile numbers as.
  mobile: { countryCode: '+91', countryFlagIso: 'IN', number: mobile },
}));

// Team members belonging to the logged-in partner's own account (used by Assign User)
export const mockTeamMembers = [
  { id: 1, name: 'Priya Verma' },
  { id: 2, name: 'Aman Gupta' },
  { id: 3, name: 'Sneha Rao' },
  { id: 4, name: 'Abhishek Kumar' },
];

// User segments (used by the Segment filter dropdown)
export const mockSegments = [
  { id: 1, name: 'Enterprise' },
  { id: 2, name: 'SMB' },
  { id: 3, name: 'Startup' },
];

// The acting partner's own SMS/Mail/Wallet pool, used as "Your Balance" in credit drawers.
export const mockPartnerSelf = {
  smsBalance: 14904,
  mailBalance: 6589,
  walletBalance: 14534.88,
};

// Emails/usernames pre-seeded as "already taken" so the Add User wizard has something
// real to validate against without a backend.
export const takenEmails = mockUsers.map((u) => u.email.toLowerCase());
export const takenUsernames = ['admin', 'test', 'demo', 'kit19'];

export const mockCountries = [
  {
    name: 'India',
    states: [
      { name: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur'] },
      { name: 'Delhi', cities: ['New Delhi'] },
      { name: 'Karnataka', cities: ['Bengaluru', 'Mysuru'] },
    ],
  },
  {
    name: 'United States',
    states: [
      { name: 'California', cities: ['Los Angeles', 'San Francisco'] },
      { name: 'New York', cities: ['New York City', 'Buffalo'] },
    ],
  },
  {
    name: 'South Africa',
    states: [
      { name: 'Gauteng', cities: ['Johannesburg', 'Pretoria'] },
      { name: 'Western Cape', cities: ['Cape Town'] },
    ],
  },
];

// Available modules for the Create Snapshot panel.
export const mockModules = [
  'Enquiries', 'Leads', 'Follow-ups', 'Appointments', 'Pipeline Deal',
  'Quotations', 'Invoices', 'Revenue', 'Roles & Rights', 'Reports',
];

export const mockTimezones = [
  '(GMT+5:30) India Standard Time',
  '(GMT+0:00) Greenwich Mean Time',
  '(GMT-5:00) Eastern Time (US & Canada)',
  '(GMT-8:00) Pacific Time (US & Canada)',
  '(GMT+2:00) South Africa Standard Time',
];
