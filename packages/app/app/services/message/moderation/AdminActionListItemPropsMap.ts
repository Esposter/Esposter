import type { VListItem } from "vuetify/components";

import { AdminActionColorMap } from "@/services/message/moderation/AdminActionColorMap";
import { AdminActionIconMap } from "@/services/message/moderation/AdminActionIconMap";
import { AdminActionType } from "@esposter/db-schema";

export const AdminActionListItemPropsMap = {
  [AdminActionType.CreateBan]: {
    appendIcon: AdminActionIconMap[AdminActionType.CreateBan],
    baseColor: AdminActionColorMap[AdminActionType.CreateBan],
    title: "Ban",
  },
  [AdminActionType.KickFromRoom]: {
    appendIcon: AdminActionIconMap[AdminActionType.KickFromRoom],
    baseColor: AdminActionColorMap[AdminActionType.KickFromRoom],
    title: "Kick",
  },
  [AdminActionType.SoftBan]: {
    appendIcon: AdminActionIconMap[AdminActionType.SoftBan],
    baseColor: AdminActionColorMap[AdminActionType.SoftBan],
    title: "Soft Ban",
  },
  [AdminActionType.TimeoutUser]: {
    appendIcon: AdminActionIconMap[AdminActionType.TimeoutUser],
    baseColor: AdminActionColorMap[AdminActionType.TimeoutUser],
    title: "Timeout",
  },
  [AdminActionType.Warn]: {
    appendIcon: AdminActionIconMap[AdminActionType.Warn],
    baseColor: AdminActionColorMap[AdminActionType.Warn],
    title: "Warn",
  },
} satisfies Partial<Record<AdminActionType, Pick<VListItem["$props"], "appendIcon" | "baseColor" | "title">>>;
