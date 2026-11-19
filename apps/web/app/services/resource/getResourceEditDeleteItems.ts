import type { Item } from "#src/models/shared/Item";
import type { Promisable } from "type-fest";

import { getEditDeleteItems } from "#src/services/ui/getEditDeleteItems";

// Rename and Delete are the same commands wherever a resource is offered, from a row's menu or a blade's header
export const getResourceEditDeleteItems = ({
  onDelete,
  onEdit,
}: {
  onDelete: () => Promisable<void>;
  onEdit: () => Promisable<void>;
}): [Item, Item] => getEditDeleteItems({ deleteLabel: "Delete", editLabel: "Rename", onDelete, onEdit });
