import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";
import type { UiDataTableColumn } from "@/models/ui/UiDataTableColumn";

import { ItemMetadataPropertyNames } from "#shared/models/entity/ItemMetadataPropertyNames";
import { ResourceListItemPropertyNames } from "#shared/models/resource/ResourceListItem";
import { formatDate } from "#shared/util/date/formatDate";
import { RESOURCE_DATE_FORMAT } from "@/services/resource/constants";
// Publish status is a capability, not a base feature, so it is surfaced per-resource (Overview / editor)
// Rather than as a mixed-type list column; created/updated apply to every resource
export const ResourceHeaders: UiDataTableColumn<ResourceListItem, keyof ResourceListItem>[] = [
  // Always rendered rather than revealed on hover: hover does not exist on touch, and a star you
  // Cannot find is a star you do not use. Titled like every other column because the column chooser lists
  // Headers by title — a blank one is a checkbox with no way to tell what it toggles
  { isSortable: false, key: "favorite", title: "Favorite" },
  { key: ResourceListItemPropertyNames.type, title: "Type" },
  { key: ResourceListItemPropertyNames.name, title: "Name" },
  {
    getValue: (item) => formatDate(item.createdAt, RESOURCE_DATE_FORMAT),
    key: ItemMetadataPropertyNames.createdAt,
    title: "Created At",
  },
  {
    getValue: (item) => formatDate(item.updatedAt, RESOURCE_DATE_FORMAT),
    key: ItemMetadataPropertyNames.updatedAt,
    title: "Updated At",
  },
  {
    // Em dash rather than a blank cell: never opened is an answer, and an empty cell reads as a failed read
    getValue: (item) => (item.lastAccessedAt ? formatDate(item.lastAccessedAt, RESOURCE_DATE_FORMAT) : "—"),
    key: ResourceListItemPropertyNames.lastAccessedAt,
    title: "Last Accessed",
  },
  { isSortable: false, key: "actions", title: "Actions" },
];
