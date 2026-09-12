// Single choke point every action handler on the Manage User page routes through.
//
// The legacy page gated some actions on a permission-table lookup (SMS credit, mail
// credit, wallet credit) but not others (plain Send Email, WhatsApp) for no principled
// reason - an inconsistent authorization surface. Routing every handler through one
// function here means wiring in real permission checks later is a one-place edit,
// not a hunt through every click handler.
//
// TODO: once a real "ManageUser" module code is registered on the backend, read the
// matching flag off `permissions` instead of always returning true.
export function canPerform(action, permissions) {
  return true;
}
