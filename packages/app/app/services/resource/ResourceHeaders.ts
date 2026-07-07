import type { DataTableHeader } from "@/models/vuetify/DataTableHeader";
import type { Resource } from "@esposter/db-schema";

import { dayjs } from "#shared/services/dayjs";
import { ItemMetadataPropertyNames } from "@esposter/shared";
// Publish status is a capability, not a base feature, so it is surfaced per-resource (Overview / editor)
// rather than as a mixed-type list column; created/updated apply to every resource
export const ResourceHeaders: DataTableHeader<Resource>[] = [
  { key: "type", title: "Type" },
  { key: "name", title: "Name" },
  {
    key: ItemMetadataPropertyNames.createdAt,
    title: "Created At",
    value: (item) => dayjs(item.createdAt).format("ddd, MMM D, YYYY h:mm A"),
  },
  {
    key: ItemMetadataPropertyNames.updatedAt,
    title: "Updated At",
    value: (item) => dayjs(item.updatedAt).format("ddd, MMM D, YYYY h:mm A"),
  },
  { key: "actions", sortable: false, title: "Actions" },
];
