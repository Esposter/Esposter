import type { Visual } from "#shared/models/dashboard/data/Visual";

import { DASHBOARD_UNTITLED_GROUP_TITLE } from "@/services/dashboard/constants";

// The title a group shows wherever it is named: its header, its move target and its aria label. A group with no title
// Shows the untitled name, so the one fallback is here rather than at each of those places
export const getGroupTitle = (group: Visual) => group.chart.configuration.title || DASHBOARD_UNTITLED_GROUP_TITLE;
