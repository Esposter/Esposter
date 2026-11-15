import type { Item } from "#src/models/shared/Item";

import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";

// Rename is the same command wherever a resource is offered, from a row's menu or a blade's header
export const getRenameResourceItem = (onClick: () => void): Item => ({
  meaning: UiIconMeaning.Edit,
  onClick,
  title: "Rename",
});
