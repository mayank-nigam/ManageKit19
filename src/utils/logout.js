export const handleLogout = async (silent = false) => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
};
export const logout = handleLogout;
