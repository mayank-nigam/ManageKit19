import React, { useState, useEffect, useRef } from 'react';
import { X, Wifi } from 'lucide-react';
import Swal from 'sweetalert2';
import { getSession } from '../../../../getSession';

// Mocks the legacy page's third-party VOIP widget (window.voipExtToMobileNo), which
// isn't available outside the real Kit19 telephony integration. This reproduces its
// look (floating call-in-progress card, live timer, "report disconnect" link) so the
// click-to-call affordance behaves the same way in this mock-data build; swap the body
// of the "start call" handler for the real voipExtToMobileNo(...) call once that
// integration is wired up.
function formatElapsed(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `00:${m}:${s}`;
}

const AGENT_NUMBER = '9811958433';

const CallWidget = ({ user, onClose }) => {
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);
  const { FName, LName } = getSession();
  const agentName = [FName, LName].filter(Boolean).join(' ') || 'Agent';

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  if (!user) return null;

  const handleReport = () => {
    clearInterval(timerRef.current);
    Swal.fire({ icon: 'success', title: 'Reported', timer: 1200, showConfirmButton: false });
    onClose();
  };

  const initialsOf = (name) => name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div
        className="w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
        role="dialog"
        aria-label="Call widget"
      >
        <div className="bg-sky-600 text-white px-4 py-2.5 flex items-center justify-between">
          <span className="text-sm font-medium">Call Widget (Kit19 80)</span>
          <button type="button" onClick={onClose} className="text-white/80 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-1">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center font-semibold ring-2 ring-green-400 ring-offset-2">
                {initialsOf(agentName)}
              </div>
              <div className="text-xs text-gray-700 text-center max-w-[6rem] truncate">{agentName}</div>
              <div className="text-[11px] text-gray-400">{AGENT_NUMBER}</div>
            </div>

            <Wifi size={18} className="text-green-500" />

            <div className="flex flex-col items-center gap-1">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-semibold">
                {initialsOf(user.name)}
              </div>
              <div className="text-[11px] text-gray-400">{user.mobile.number}</div>
            </div>
          </div>

          <div className="text-center mt-4">
            <div className="text-xs text-gray-400">Submitted</div>
            <div className="text-lg font-semibold text-gray-900">{formatElapsed(elapsed)}</div>
          </div>
        </div>

        <div className="bg-gray-50 border-t border-gray-100 px-4 py-2.5 text-center text-xs text-gray-500">
          Call Disconnected? <button type="button" onClick={handleReport} className="text-sky-600 hover:underline font-medium">Click to report</button>
        </div>
      </div>
    </div>
  );
};

export default CallWidget;
