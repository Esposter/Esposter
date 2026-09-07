import { AdminActionIconMap } from "@/services/message/moderation/AdminActionIconMap";
import { AdminActionTypes } from "@esposter/db-schema";

// "" = unfiltered ("All …") — clearable is avoided since it emits null
export const AdminActionTypeSelectItems = [
  { title: "All actions", value: "" },
  ...AdminActionTypes.map((adminActionType) => ({
    props: { prependIcon: AdminActionIconMap[adminActionType] },
    title: adminActionType,
    value: adminActionType,
  })),
];
