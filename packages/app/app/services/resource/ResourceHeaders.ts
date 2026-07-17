import type { DataTableHeader } from "@/models/vuetify/DataTableHeader";
import type { Resource } from "@esposter/db-schema";

import { dayjs } from "#shared/services/dayjs";
import { RESOURCE_DATE_FORMAT } from "@/services/resource/constants";
import { ItemMetadataPropertyNames } from "@esposter/shared";
// Publish status is a capability, not a base feature, so it is surfaced per-resource (Overview / editor)
// Rather than as a mixed-type list column; created/updated apply to every resource
export const ResourceHeaders: DataTableHeader<Resource>[] = [
  // Always rendered rather than revealed on hover: hover does not exist on touch, and a star you
  // Cannot find is a star you do not use
  { key: "favorite", sortable: false, title: "" },
  { key: "type", title: "Type" },
  { key: "name", title: "Name" },
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
  { key: "actions", sortable: false, title: "Actions" },
];
