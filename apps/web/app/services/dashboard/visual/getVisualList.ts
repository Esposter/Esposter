import type { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import type { Visual } from "#shared/models/dashboard/data/Visual";

// The list a group holds, or the dashboard's own list when there is no group. A group always holds its list, so the
// Dashboard's is read only where there is no group
export const getVisualList = (dashboard: Dashboard, group: undefined | Visual) => group?.visuals ?? dashboard.visuals;
