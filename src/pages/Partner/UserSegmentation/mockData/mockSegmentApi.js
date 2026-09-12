import axios from 'axios';
import { getSession } from '../../../../getSession';

const API_BASE = (process.env.REACT_APP_SERVICES_API_BASE_URL || '').replace(/\/$/, '');

// Helper to build standard request payload
const buildPayload = (extraDetails = {}) => {
  const { TokenId, userId } = getSession();
  return {
    Token: TokenId,
    LoggedUserId: String(userId || ''),
    Message: '',
    MAC_Address: '',
    IP_Address: '',
    Details: {
      USERID: String(userId || ''),
      ...extraDetails,
    },
  };
};

export async function fetchSegments(params = {}) {
  try {
    const { nameSearch = '', status = '', fromDate = '', toDate = '', page = 1, pageSize = 20 } = params;
    const { userId } = getSession();

    const response = await axios.post(
      `${API_BASE}${'/BannerSetting/GetUserSegmentListByUserId'}`,
      {
        Token: getSession().TokenId,
        LoggedUserId: String(userId || ''),
        UserId: String(userId || ''),
        SearchText: nameSearch || '',
        Status: status || '',
        FromDate: fromDate || '',
        ToDate: toDate || '',
        // DataTable pagination
        draw: page,
        start: (page - 1) * pageSize,
        length: pageSize,
      }
    );

    const data = response.data;
    return {
      Status: data.Status || 0,
      Details: {
        rows: data.Details || [],
        total: data.recordsTotal || 0,
      },
      Message: data.Message || 'OK',
    };
  } catch (error) {
    console.error('fetchSegments error:', error);
    return { Status: 0, Details: { rows: [], total: 0 }, Message: error.message };
  }
}

export async function toggleSegmentStatus(id, status) {
  try {
    const { userId } = getSession();
    const jsonSetting = {
      Id: id,
      SegmentName: '',
      LogicalOperator: 'and',
      Status: status ? 'Active' : 'Inactive',
    };

    const response = await axios.post(
      `${API_BASE}${'/BannerSetting/UpdateUserSegmentByMode'}`,
      {
        Token: getSession().TokenId,
        LoggedUserId: String(userId || ''),
        UserId: String(userId || ''),
        Id: id,
        mode: 'updateStatus',
        JsonSetting: JSON.stringify(jsonSetting),
      }
    );

    const data = response.data;
    return {
      Status: data.Status || 0,
      Details: data.Details || null,
      Message: data.Message || 'Status updated',
    };
  } catch (error) {
    console.error('toggleSegmentStatus error:', error);
    return { Status: 0, Details: null, Message: error.message };
  }
}

export async function getSegmentDetails(id) {
  try {
    const { userId } = getSession();

    const response = await axios.post(
      `${API_BASE}${'/BannerSetting/GetUserSegmentDetails'}`,
      {
        Token: getSession().TokenId,
        LoggedUserId: String(userId || ''),
        UserId: String(userId || ''),
        Id: id,
      }
    );

    const data = response.data;
    return {
      Status: data.Status || 0,
      Details: data.Details || null,
      Message: data.Message || 'OK',
    };
  } catch (error) {
    console.error('getSegmentDetails error:', error);
    return { Status: 0, Details: null, Message: error.message };
  }
}

export async function getRecordCount(id) {
  try {
    const { userId } = getSession();

    // Get segment details first to retrieve record count
    const response = await axios.post(
      `${API_BASE}${'/BannerSetting/GetUserSegmentDetails'}`,
      {
        Token: getSession().TokenId,
        LoggedUserId: String(userId || ''),
        UserId: String(userId || ''),
        Id: id,
      }
    );

    const data = response.data;
    return {
      Status: data.Status || 0,
      Details: data.Details || { count: 0 },
      Message: data.Message || 'OK',
    };
  } catch (error) {
    console.error('getRecordCount error:', error);
    return { Status: 0, Details: { count: 0 }, Message: error.message };
  }
}

export async function saveSegment(payload) {
  try {
    const { userId } = getSession();
    const { id, name, logicalOperator = 'and', conditions = [] } = payload;

    const requestPayload = {
      Token: getSession().TokenId,
      LoggedUserId: String(userId || ''),
      UserId: String(userId || ''),
      Id: id || 0,
      SegmentName: name || '',
      LogicalOperator: logicalOperator,
      Conditions: JSON.stringify(conditions),
      SettingJSON: JSON.stringify({
        Id: id || 0,
        SegmentName: name || '',
        LogicalOperator: logicalOperator,
        Conditions: conditions,
      }),
    };

    const response = await axios.post(
      `${API_BASE}${'/BannerSetting/SaveUpdateUserSegment'}`,
      requestPayload
    );

    const data = response.data;
    return {
      Status: data.Status || 0,
      Details: data.Details || null,
      Message: data.Message || 'Segment saved',
    };
  } catch (error) {
    console.error('saveSegment error:', error);
    return { Status: 0, Details: null, Message: error.message };
  }
}
