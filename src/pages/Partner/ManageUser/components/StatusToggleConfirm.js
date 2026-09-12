import Swal from 'sweetalert2';

// Turning a user OFF requires confirmation (they'll be logged out immediately);
// turning ON does not. This mirrors the legacy page's rule (ST-2) intentionally -
// it's one of the few legacy behaviors that was already correct.
export function confirmStatusOff(userName) {
  return Swal.fire({
    title: 'Deactivate this user?',
    html: `<b>${userName}</b> will not be able to log in to the panel if you proceed.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, deactivate',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#dc2626',
    reverseButtons: true,
  }).then((result) => result.isConfirmed);
}
