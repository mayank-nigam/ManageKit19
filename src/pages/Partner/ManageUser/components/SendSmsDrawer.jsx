import React, { useState, useEffect } from 'react';
import { Drawer, Input, Button } from 'antd';
import { MessageSquare } from 'lucide-react';
import Swal from 'sweetalert2';

const { TextArea } = Input;
const MAX_LEN = 320;

// Quick "Send SMS" compose panel, reached from the Mobile column's dropdown - matches
// the legacy MA-1 action (send a message to this user's number). This is a lightweight
// stand-in for the full Send SMS overlay (§7.1 of the business rules: DLT sender-id
// list, template picker, India/Non-India toggle) - that overlay is a large separate
// feature and out of scope here; this covers the same entry point with a simple compose
// form so the Mobile dropdown isn't a dead end.
const SendSmsDrawer = ({ open, user, onClose, onSend }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) setMessage('');
  }, [open, user]);

  if (!user) return null;

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    await onSend(user.id, message);
    setSending(false);
    Swal.fire({ icon: 'success', title: 'SMS sent', timer: 1200, showConfirmButton: false });
    onClose();
  };

  return (
    <Drawer
      title={
        <span className="inline-flex items-center gap-2">
          <MessageSquare size={16} className="text-emerald-500" /> Send SMS
        </span>
      }
      open={open}
      onClose={onClose}
      width={400}
      className="manage-user-drawer"
      footer={
        <div className="flex justify-between">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            className="bg-green-600 hover:bg-green-700 border-green-600"
            loading={sending}
            disabled={!message.trim()}
            onClick={handleSend}
          >
            Send
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
          <Input disabled value={`${user.mobile.countryFlagIso} ${user.mobile.number}`} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <TextArea
            rows={5}
            maxLength={MAX_LEN}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
          />
          <div className="text-right text-xs text-gray-400 mt-1">{message.length}/{MAX_LEN}</div>
        </div>
      </div>
    </Drawer>
  );
};

export default SendSmsDrawer;
