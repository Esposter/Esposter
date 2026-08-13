import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";
import type { DataTableHeader } from "@/models/vuetify/DataTableHeader";

import { ResourceListItemPropertyNames } from "#shared/models/resource/ResourceListItem";
import { dayjs } from "#shared/services/dayjs";
import { RESOURCE_DATE_FORMAT } from "@/services/resource/constants";
import { ItemMetadataPropertyNames } from "@esposter/shared";
// Publish status is a capability, not a base feature, so it is surfaced per-resource (Overview / editor)
// Rather than as a mixed-type list column; created/updated apply to every resource
export const ResourceHeaders: DataTableHeader<ResourceListItem>[] = [
  // Always rendered rather than revealed on hover: hover does not exist on touch, and a star you
  // Cannot find is a star you do not use. Titled like every other column because the column chooser lists
  // Headers by title — a blank one is a checkbox with no way to tell what it toggles
  { key: "favorite", sortable: false, title: "Favorite" },
  { key: ResourceListItemPropertyNames.type, title: "Type" },
  { key: ResourceListItemPropertyNames.name, title: "Name" },
  {
    key: ItemMetadataPropertyNames.createdAt,
    title: "Created At",
    value: (item) => dayjs(item.createdAt).format(RESOURCE_DATE_FORMAT),
  },
  {
    key: ItemMetadataPropertyNames.updatedAt,
    title: "Updated At",
    value: (item) => dayjs(item.updatedAt).format(RESOURCE_DATE_FORMAT),
  },
  {
    key: ResourceListItemPropertyNames.lastAccessedAt,
    title: "Last Accessed",
    // Em dash rather than a blank cell: never opened is an answer, and an empty cell reads as a failed read
    value: (item) => (item.lastAccessedAt ? dayjs(item.lastAccessedAt).format(RESOURCE_DATE_FORMAT) : "—"),
  },
  { key: "actions", sortable: false, title: "Actions" },
];
