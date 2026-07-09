// Application-wide constants

export const APP_NAME = 'Kit19 CRM';
export const APP_VERSION = '1.0.0';

// API Configuration
export const API_BASE_URL = process.env.REACT_APP_KIT19_API_URL || 'http://localhost:5000/api';
export const API_TIMEOUT = 30000;

// Pagination
export const DEFAULT_PAGE_SIZE = 25;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100, 200];

// Roles
export const ROLES = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  SALES_REP: 'SalesRep',
  VIEWER: 'Viewer'
};

// Permissions
export const PERMISSIONS = {
  ENQUIRY_VIEW: 'enquiry.view',
  ENQUIRY_CREATE: 'enquiry.create',
  ENQUIRY_EDIT: 'enquiry.edit',
  ENQUIRY_DELETE: 'enquiry.delete',
  ENQUIRY_IMPORT: 'enquiry.import',
  ENQUIRY_EXPORT: 'enquiry.export',
  LEAD_VIEW: 'lead.view',
  LEAD_CREATE: 'lead.create',
  LEAD_EDIT: 'lead.edit',
  LEAD_DELETE: 'lead.delete',
  LEAD_ASSIGN: 'lead.assign',
  FOLLOWUP_VIEW: 'followup.view',
  FOLLOWUP_CREATE: 'followup.create',
  FOLLOWUP_EDIT: 'followup.edit',
  DEAL_VIEW: 'deal.view',
  DEAL_CREATE: 'deal.create',
  DEAL_EDIT: 'deal.edit',
  QUOTATION_VIEW: 'quotation.view',
  QUOTATION_CREATE: 'quotation.create',
  INVOICE_VIEW: 'invoice.view',
  INVOICE_CREATE: 'invoice.create',
  REVENUE_VIEW: 'revenue.view',
  SETTINGS_MANAGE: 'settings.manage'
};

// Enquiry Types
export const ENQUIRY_TYPES = {
  OPEN: 'Open',
  LEAD: 'Lead'
};

// Follow-up Status
export const FOLLOWUP_STATUS = [
  'Not Connected',
  'Callback Requested',
  'Interested',
  'Not Interested',
  'Qualified',
  'Not Qualified',
  'Converted',
  'Lost'
];

// Lead Sources
export const LEAD_SOURCES = [
  'Website',
  'Social Media',
  'Referral',
  'Cold Call',
  'Email Campaign',
  'Event',
  'Partner',
  'Other'
];

// Lead Mediums
export const LEAD_MEDIUMS = [
  'Organic',
  'Paid',
  'Direct',
  'Referral',
  'Email',
  'Social'
];

// Activity Types
export const ACTIVITY_TYPES = {
  CALL: 'call',
  SMS: 'sms',
  EMAIL: 'email',
  WHATSAPP: 'whatsapp',
  NOTE: 'note',
  TASK: 'task',
  MEETING: 'meeting',
  APPOINTMENT: 'appointment',
  FOLLOWUP: 'followup'
};

// Deal Stages
export const DEAL_STAGES = [
  { id: 1, name: 'Qualification', probability: 10 },
  { id: 2, name: 'Needs Analysis', probability: 25 },
  { id: 3, name: 'Proposal', probability: 50 },
  { id: 4, name: 'Negotiation', probability: 75 },
  { id: 5, name: 'Closed Won', probability: 100 },
  { id: 6, name: 'Closed Lost', probability: 0 }
];

// Task Priorities
export const TASK_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

// Task Status
export const TASK_STATUS = ['To Do', 'In Progress', 'Completed', 'Cancelled'];

// Appointment Types
export const APPOINTMENT_TYPES = {
  VIRTUAL: 'Virtual',
  PHYSICAL: 'Physical'
};

// Date Formats
export const DATE_FORMAT = 'dd/MM/yyyy';
export const DATETIME_FORMAT = 'dd/MM/yyyy HH:mm';
export const TIME_FORMAT = 'HH:mm';

// Country Codes
export const COUNTRY_CODES = [
  { code: '+1', country: 'USA' },
  { code: '+44', country: 'UK' },
  { code: '+91', country: 'India' },
  { code: '+61', country: 'Australia' },
  { code: '+971', country: 'UAE' }
];

// Export Formats
export const EXPORT_FORMATS = ['CSV', 'Excel', 'PDF'];

// Theme Colors
export const THEME = {
  primary: '#2a9629', // Updated Kit19 Green
  secondary: '#10B981', // Green
  danger: '#EF4444', // Red
  warning: '#F59E0B', // Amber
  info: '#3B82F6', // Blue
  success: '#10B981' // Green
};

// Utility: convert hex to rgba string
export function hexToRgba(hex, alpha = 1) {
  const cleaned = hex.replace('#', '');
  const bigint = parseInt(cleaned, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
