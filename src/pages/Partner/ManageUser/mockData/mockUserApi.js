// Mock "API" layer for the Manage User page.
//
// Every function here is written the way a real backend call would be: it accepts a
// params/payload object, resolves asynchronously, and returns { Status, Details, Message }
// - the same response envelope shape used by this app's real endpoints (see
// CollaboratorTeam.jsx's axios.post usage). That means swapping a function's body for a
// real `axios.post(url, payload)` later is an isolated change; call sites in the page
// components never need to change shape.
import { mockUsers, mockPartnerSelf, takenEmails, takenUsernames } from './mockUsers';

const LATENCY_MS = 350;

// In-memory "database" - mutated in place so the mock behaves like a real backend
// across calls within a single session.
let users = [...mockUsers];
let partnerSelf = { ...mockPartnerSelf };

const delay = (ms = LATENCY_MS) => new Promise((resolve) => setTimeout(resolve, ms));

function applyFilters(list, { nameSearch, userType, segmentId } = {}) {
  let result = list;

  if (nameSearch) {
    const q = nameSearch.toLowerCase();
    result = result.filter((u) => u.name.toLowerCase().includes(q));
  }
  if (userType && userType !== 0) {
    if (userType === 4) {
      // "Partner" filter option (any tier) when a specific PartnerType isn't given
      result = result.filter((u) => u.userType === 4);
    } else {
      result = result.filter((u) => u.userType === userType);
    }
  }
  if (segmentId) {
    result = result.filter((u) => u.segmentId === segmentId);
  }
  return result;
}

export async function fetchUsers(params = {}) {
  await delay();
  const { page = 1, pageSize = 10, partnerType } = params;

  let filtered = applyFilters(users, params);
  if (partnerType) {
    filtered = filtered.filter((u) => u.partnerType === partnerType);
  }

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const rows = filtered.slice(start, start + pageSize);

  return { Status: 1, Details: { rows, total }, Message: 'OK' };
}

export async function toggleUserStatus(id, status) {
  await delay(250);
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) {
    return { Status: 0, Details: null, Message: 'User not found' };
  }
  users[idx] = { ...users[idx], status };
  return { Status: 1, Details: users[idx], Message: 'Status updated successfully' };
}

export async function updateSubscription(id, payload) {
  await delay();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) {
    return { Status: 0, Details: null, Message: 'User not found' };
  }
  const current = users[idx];
  const endDate = payload.pendingTillDate || current.subscription.endDate;
  users[idx] = {
    ...current,
    subscription: { ...current.subscription, endDate },
  };
  return { Status: 1, Details: users[idx], Message: 'Subscription updated successfully' };
}

export async function assignUser(id, teamMemberId, teamMemberName) {
  await delay(250);
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) {
    return { Status: 0, Details: null, Message: 'User not found' };
  }
  users[idx] = { ...users[idx], assignedTo: teamMemberName };
  return { Status: 1, Details: users[idx], Message: 'User assigned successfully' };
}

export async function addCredit(id, creditType, amount) {
  await delay();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) {
    return { Status: 0, Details: null, Message: 'User not found' };
  }
  const balanceKey = `${creditType}Balance`;
  if (Number(amount) > partnerSelf[balanceKey]) {
    return { Status: 0, Details: null, Message: 'Amount exceeds your available balance' };
  }
  partnerSelf = { ...partnerSelf, [balanceKey]: partnerSelf[balanceKey] - amount };
  users[idx] = { ...users[idx], [balanceKey]: users[idx][balanceKey] + Number(amount) };
  return {
    Status: 1,
    Details: { user: users[idx], partnerSelf },
    Message: 'Credit added successfully',
  };
}

export async function addUser(payload) {
  await delay();
  const email = (payload.email || '').toLowerCase();
  const username = (payload.username || '').toLowerCase();

  if (takenEmails.includes(email)) {
    return { Status: 0, Details: null, Message: 'This email is already registered' };
  }
  if (takenUsernames.includes(username)) {
    return { Status: 0, Details: null, Message: 'This username is already taken' };
  }

  const newUser = {
    id: Date.now(),
    name: `${payload.firstName || ''} ${payload.lastName || ''}`.trim() || payload.username,
    avatarUrl: null,
    userType: 1,
    partnerType: null,
    isWhiteLabeled: false,
    isDomainVerified: false,
    mobile: { countryCode: payload.dialCode || '+91', countryFlagIso: payload.countryIso || 'IN', number: payload.mobile },
    email: payload.email,
    allowUserCount: 0,
    totalActiveUser: 1,
    subscription: { startDate: new Date().toISOString().slice(0, 10), endDate: new Date().toISOString().slice(0, 10) },
    assignedTo: '',
    smsBalance: 0,
    mailBalance: 0,
    walletBalance: 0,
    segmentId: 1,
    status: 1,
  };

  users = [newUser, ...users];
  return { Status: 1, Details: newUser, Message: 'User created successfully' };
}

export async function createSnapshot(id, payload) {
  await delay();
  const user = users.find((u) => u.id === id);
  if (!user) {
    return { Status: 0, Details: null, Message: 'User not found' };
  }
  return { Status: 1, Details: { snapshotName: payload.snapshotName, modules: payload.modules }, Message: 'Snapshot created successfully' };
}

export async function upgradeUser(id, payload) {
  await delay();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) {
    return { Status: 0, Details: null, Message: 'User not found' };
  }
  users[idx] = {
    ...users[idx],
    userType: 4,
    partnerType: payload.partnerType,
  };
  return { Status: 1, Details: users[idx], Message: 'User upgraded successfully' };
}

export async function changePartnerRequest(id, payload) {
  await delay();
  const user = users.find((u) => u.id === id);
  if (!user) {
    return { Status: 0, Details: null, Message: 'User not found' };
  }
  return { Status: 1, Details: { partnerId: payload.partnerId }, Message: 'Change partner request sent successfully' };
}

export async function bulkAssignTeam(userIds, teamMemberId, teamMemberName) {
  await delay(400);
  users = users.map((u) => (userIds.includes(u.id) ? { ...u, assignedTo: teamMemberName } : u));
  return { Status: 1, Details: { count: userIds.length }, Message: 'Team assigned successfully' };
}

export async function sendSms(id, message) {
  await delay(400);
  const user = users.find((u) => u.id === id);
  if (!user) {
    return { Status: 0, Details: null, Message: 'User not found' };
  }
  return { Status: 1, Details: { mobile: user.mobile.number, message }, Message: 'SMS sent successfully' };
}

export async function exportUsers(filters = {}) {
  await delay(400);
  const filtered = applyFilters(users, filters);
  return { Status: 1, Details: { rows: filtered }, Message: 'OK' };
}

export function getPartnerSelf() {
  return partnerSelf;
}

export function checkAvailability({ email, username }) {
  const result = {};
  if (email !== undefined) {
    result.emailTaken = takenEmails.includes(email.toLowerCase());
  }
  if (username !== undefined) {
    result.usernameTaken = takenUsernames.includes(username.toLowerCase());
  }
  return result;
}
