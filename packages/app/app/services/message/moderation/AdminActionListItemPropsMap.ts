import type { VListItem } from "vuetify/components";

import { AdminActionColorMap } from "@/services/message/moderation/AdminActionColorMap";
import { AdminActionIconMap } from "@/services/message/moderation/AdminActionIconMap";
import { AdminActionTitleMap } from "@/services/message/moderation/AdminActionTitleMap";

// Derived from the title/icon/color maps so each admin action's metadata has one source of truth per concern.
export const AdminActionListItemPropsMap = Object.fromEntries(
  (Object.keys(AdminActionTitleMap) as (keyof typeof AdminActionTitleMap)[]).map((type) => [
    type,
    { appendIcon: AdminActionIconMap[type], baseColor: AdminActionColorMap[type], title: AdminActionTitleMap[type] },
  ]),
) as Record<keyof typeof AdminActionTitleMap, Pick<VListItem["$props"], "appendIcon" | "baseColor" | "title">>;
