import React, { useState } from 'react';
import { Table, Tooltip } from 'antd';
import { Copy } from 'lucide-react';
import Swal from 'sweetalert2';
import { formatDateToDDMmmYYYY } from '../../ManageUser/utils/formatDate';
import EmptyState from '../../shared/EmptyState';

const CopyUrlButton = ({ url }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      Swal.fire({
        icon: 'success',
        title: 'Copied!',
        text: 'The URL has been copied to your clipboard.',
        timer: 1500,
        showConfirmButton: false,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      Swal.fire('Error', 'Failed to copy URL.', 'error');
    }
  };

  return (
    <Tooltip title={copied ? 'Copied!' : 'Copy URL'}>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center justify-center p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
      >
        <Copy size={14} />
      </button>
    </Tooltip>
  );
};

const SnapshotGrid = ({
  snapshots,
  loading,
  pagination,
  onTableChange,
  baseUrl,
}) => {
  const columns = [
    {
      title: 'Name',
      dataIndex: 'SnapshotName',
      key: 'SnapshotName',
      width: '25%',
      render: (val) => <span className="text-sm">{val}</span>,
    },
    {
      title: 'User',
      dataIndex: 'UserName',
      key: 'UserName',
      width: '25%',
      render: (val) => <span className="text-sm">{val}</span>,
    },
    {
      title: 'Date',
      dataIndex: 'CreatedOn',
      key: 'CreatedOn',
      width: '25%',
      render: (val) => <span className="text-sm">{formatDateToDDMmmYYYY(val)}</span>,
    },
    {
      title: 'Link',
      key: 'Link',
      width: '25%',
      render: (_, record) => {
        const url = `${baseUrl}/UserCRMCampaign/snapshot/SnapshotSetting.aspx?SnapshotId=${record.Guid}`;
        return (
          <div className="flex items-center gap-1 min-w-0">
            <Tooltip title={url}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 truncate max-w-[280px] inline-block"
              >
                {url}
              </a>
            </Tooltip>
            <CopyUrlButton url={url} />
          </div>
        );
      },
    },
  ];

  return (
    <div className="partner-table-container">
      <Table
        rowKey="Id"
        columns={columns}
        dataSource={snapshots}
        loading={loading}
        pagination={pagination}
        onChange={onTableChange}
        scroll={{ x: 900 }}
        locale={{
          emptyText: <EmptyState message="No record found." />,
        }}
      />
    </div>
  );
};

export default SnapshotGrid;
