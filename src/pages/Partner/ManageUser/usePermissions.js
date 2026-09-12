import { useState, useEffect, useCallback } from 'react';
import { getSession } from '../../../getSession';
import API_ENDPOINTS from '../../../config/apiEndpoints';

const permissionCache = new Map();

/**
 * Custom hook to fetch user permissions for a specific module or modules.
 * Verbatim copy of the pattern used across RolesAndRights pages (see
 * src/pages/RolesAndRights/CollaboratorTeam/usePermissions.js), kept identical so this
 * page's plumbing matches its siblings.
 *
 * NOTE: "PAG-MANAGEUSER-MOCK" below is a placeholder module code - no such module is
 * registered on the backend yet. In practice this means the permission-by-module-code
 * endpoint will return an empty list for it, which the actual gating in this page
 * ignores anyway (see ../utils/permissionGate.js). Replace with a real module code once
 * the Manage User module is registered in RolePermissionMapping/ModuleMaster.
 * @param {string} moduleCode - A single module code (e.g. "PAG10031") or a comma-separated list of codes.
 * @returns {object} - Returns { permissions, loading, error, refetch }
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
            const cachedList = permissionCache.get(cacheKey);
            setPermissions(cachedList);
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
                // Deliberately no access-denied redirect here: this module isn't
                // registered on the backend yet, so an empty/mismatched permission
                // list is expected during the mock-data phase, not a real denial.
            } else {
                throw new Error(`Failed to fetch permissions. Status: ${response.status}`);
            }
        } catch (err) {
            // Swallow errors quietly - this page's gating doesn't depend on the
            // result yet (see utils/permissionGate.js), so a failed/missing
            // endpoint should never block the mock UI.
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
