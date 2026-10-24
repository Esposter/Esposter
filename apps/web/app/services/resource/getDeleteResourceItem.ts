import type { Item } from "@/models/shared/Item";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

// Delete is the same danger-coloured command wherever a resource is offered, from a row's menu or a blade's header
export const getDeleteResourceItem = (onClick: () => void): Item => ({
  isDanger: true,
  meaning: UiIconMeaning.Delete,
  onClick,
  title: "Delete",
});
