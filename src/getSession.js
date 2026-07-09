
/**
 * Get auth token - checks both SSO and legacy token keys
 */
export const getToken = () => {
  return localStorage.getItem('Token') || localStorage.getItem('kit_token') || localStorage.getItem('kit_sso_token') || null;
};

export const getSession = () => {
  const token = getToken();
  const userId = parseInt(localStorage.getItem('userId') || localStorage.getItem('kit_userId'), 10);
  const parentId = parseInt(localStorage.getItem('ParentID') || localStorage.getItem('kit_parentId'), 10);


  return {
    token: token || null,
    userId: isNaN(userId) ? null : userId,
    parentId: isNaN(parentId) ? null : parentId,
    FName: localStorage.getItem('FName') || '',
    LName: localStorage.getItem('LName') || '',
    EMail: localStorage.getItem('email') || localStorage.getItem('EMail') || '',
    Mobile: localStorage.getItem('Mobile') || '',
    ProfilePicturePath: localStorage.getItem('ProfilePicturePath') || '',
    domain: localStorage.getItem('kit_domain') || '',
    DisplayName: localStorage.getItem('DisplayName') || '',
    Logo: localStorage.getItem('Logo') || '',
    LoginName: localStorage.getItem('LoginName') || localStorage.getItem('kit_loginName') || '',
    isAuthenticated: !!token && !isNaN(userId) && !isNaN(parentId),
    channelProfileId: localStorage.getItem('channelProfileId') || '',
    channelToken: localStorage.getItem('channelToken') || '',
    APIKey: localStorage.getItem('APIKEY') || '',
    TokenId: "-2295521862261168",
    EncryptionKey: "kit19SecretKey@123"
  };
};
