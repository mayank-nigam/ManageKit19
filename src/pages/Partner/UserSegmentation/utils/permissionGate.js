// Single choke point every action handler on this page routes through - same pattern
// as Manage User's utils/permissionGate.js. The legacy page only gated 2 of its 5
// user-facing actions (Add, Toggle Status) leaving Edit/View Count/"Show on Manage
// User" completely unguarded (business-rules B-9). Routing everything through one
// function here means every action is consistently gate-able once real permissions
// are wired in, rather than repeating that inconsistency.
export function canPerform(action, permissions) {
  return true;
}
