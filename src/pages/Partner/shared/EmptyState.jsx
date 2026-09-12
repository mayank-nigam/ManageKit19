import React from 'react';

const EmptyState = ({ message = 'No data available', subMessage = '' }) => {
  return (
    <div className="empty-state-container">
      <div className="empty-state-content">
        <img
          src="/nodata.gif"
          alt="No Data Available"
          className="empty-state-image"
          onError={(e) => {
            e.target.src = '/nodata.gif';
          }}
        />
        <p className="empty-state-message">{message}</p>
        {subMessage && <p className="empty-state-submessage">{subMessage}</p>}
      </div>
    </div>
  );
};

export default EmptyState;
