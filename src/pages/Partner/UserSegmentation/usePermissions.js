import { useState, useEffect, useCallback } from 'react';
import { getSession } from '../../../getSession';
import API_ENDPOINTS from '../../../config/apiEndpoints';

const permissionCache = new Map();

/**
 * Verbatim copy of the established per-page permissions hook pattern (see
 * ../ManageUser/usePermissions.js / RolesAndRights/CollaboratorTeam/usePermissions.js).
 *
 * NOTE: "PAG-USERSEGMENTATION-MOCK" is a placeholder module code - no such module is
 * registered on the backend yet. Actual gating in this page routes through
 * ./utils/permissionGate.js, which ignores the fetched permissions for now.
 * @param {string} moduleCode
 * @returns {object} - { permissions, loading, error, refetch }
 */
const usePermissions = (moduleCode) => {
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPermissions = useCallback(async (force = false) => {
        if (!moduleCode) {
            setLoading(false);
            return;
        }

        const { TokenId, userId } = getSession();
        const uid = userId || "34594";
        const cacheKey = `${uid}_${moduleCode}`;

        if (!force && permissionCache.has(cacheKey)) {
            setPermissions(permissionCache.get(cacheKey));
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const token = TokenId || "-2295521862261168";
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
            } else {
                throw new Error(`Failed to fetch permissions. Status: ${response.status}`);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [moduleCode]);

    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    return { permissions, loading, error, refetch: fetchPermissions };
};

export default usePermissions;
