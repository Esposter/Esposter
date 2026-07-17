import type { DataTableHeader } from "@/models/vuetify/DataTableHeader";
import type { Resource } from "@esposter/db-schema";

import { dayjs } from "#shared/services/dayjs";
import { getPurgesInText } from "@/services/resource/getPurgesInText";
import { RESOURCE_DATE_FORMAT } from "@/services/resource/constants";
import { ItemMetadataPropertyNames } from "@esposter/shared";
// The bin answers two questions the main list never asks: when did this go, and how long have I got
export const DeletedResourceHeaders: DataTableHeader<Resource>[] = [
  { key: "type", title: "Type" },
  { key: "name", title: "Name" },
  {
    key: ItemMetadataPropertyNames.deletedAt,
    title: "Deleted At",
    value: (item) => (item.deletedAt ? dayjs(item.deletedAt).format(RESOURCE_DATE_FORMAT) : ""),
  },
  { key: "purgesIn", sortable: false, title: "Retention", value: (item) => getPurgesInText(item.deletedAt) },
  { key: "actions", sortable: false, title: "Actions" },
];
