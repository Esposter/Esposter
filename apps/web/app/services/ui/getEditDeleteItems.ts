import type { Item } from "#src/models/shared/Item";
import type { Promisable } from "type-fest";

import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";

// The Edit and Delete a thing's menus offer, Edit first and Delete last in the danger colour. An overflow button and a
// Context menu over one thing both build them here, so the two never disagree
export const getEditDeleteItems = ({
  deleteLabel,
  editLabel,
  onDelete,
  onEdit,
}: {
  deleteLabel: string;
  editLabel: string;
  onDelete: () => Promisable<void>;
  onEdit: () => Promisable<void>;
}): [Item, Item] => [
  { meaning: UiIconMeaning.Edit, onClick: onEdit, title: editLabel },
  { isDanger: true, meaning: UiIconMeaning.Delete, onClick: onDelete, title: deleteLabel },
];
