import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession } from '../../../getSession';
import API_ENDPOINTS from '../../../config/apiEndpoints';

const permissionCache = new Map();

/**
 * Custom hook to fetch user permissions for a specific module or modules.
 * @param {string} moduleCode - A single module code (e.g. "PAG10031") or a comma-separated list of codes.
 * @returns {object} - Returns { permissions, loading, error, refetch }
 */
const usePermissions = (moduleCode) => {
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchPermissions = useCallback(async (force = false) => {
        if (!moduleCode) {
            setLoading(false);
            return;
        }

        const { TokenId, userId } = getSession();
        const uid = userId || "34594";
        const cacheKey = `${uid}_${moduleCode}`;

        if (!force && permissionCache.has(cacheKey)) {
            const cachedList = permissionCache.get(cacheKey);
            setPermissions(cachedList);
            setLoading(false);
            if (cachedList.length > 0) {
                const crmPerms = cachedList.find(p => p.ModuleCode === moduleCode) || cachedList[0];
                if (crmPerms && crmPerms.View === false) {
                    navigate('/access-denied');
                }
            }
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const { TokenId, userId } = getSession();

            // Provide fallbacks identical to other modules in Kit19Sales
            const token = TokenId || "-2295521862261168";
            const uid = userId || "34594";

            // Ensure proper API BASE matching the payload structure
            const API_BASE = (process.env.REACT_APP_SERVICES_AZURE_BASEURL || '').replace(/\/$/, '');
            const GetAll_permissionByModule_Code = `${API_BASE}${API_ENDPOINTS.COMMON.GET_ALL_PERMISSION_BY_MODULE_CODE}`;

            const payload = {
                Token: String(token),
                Details: {
                    Mode: "S",
                    ModuleCode: String(moduleCode),
                    UserId: String(uid)
                }
            };

            const response = await fetch(GetAll_permissionByModule_Code, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();

                // Typical WCF / Kit19 API unwrapping
                const list = data?.Details || data?.d || data?.Data || data?.data || data || [];

                let parsedList = [];
                if (Array.isArray(list)) {
                    parsedList = list;
                } else if (typeof list === 'string') {
                    try {
                        parsedList = JSON.parse(list);
                    } catch (e) {
                        parsedList = [];
                    }
                }

                setPermissions(parsedList);
                permissionCache.set(cacheKey, parsedList);

                // Global Access Denied Check
                if (parsedList.length > 0) {
                    const crmPerms = parsedList.find(p => p.ModuleCode === moduleCode) || parsedList[0];
                    if (crmPerms && crmPerms.View === false) {
                        navigate('/access-denied');
                    }
                }
            } else {
                throw new Error(`Failed to fetch permissions. Status: ${response.status}`);
            }
        } catch (err) {
            console.error('Error fetching permissions:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [moduleCode, navigate]);

    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    return { permissions, loading, error, refetch: fetchPermissions };
};

export default usePermissions;
