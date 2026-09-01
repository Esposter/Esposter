import type { DataTableHeader } from "@/models/vuetify/DataTableHeader";
import type { Resource } from "@esposter/db-schema";

import { formatDate } from "#shared/util/date/formatDate";
import { RESOURCE_DATE_FORMAT } from "@/services/resource/constants";
import { getPurgesInText } from "@/services/resource/getPurgesInText";
import { ItemMetadataPropertyNames } from "@esposter/shared";
// The bin answers two questions the main list never asks: when did this go, and how long have I got
export const DeletedResourceHeaders: DataTableHeader<Resource>[] = [
  { key: "type", title: "Type" },
  { key: "name", title: "Name" },
  {
    key: ItemMetadataPropertyNames.deletedAt,
    title: "Deleted At",
    value: (item) => (item.deletedAt ? formatDate(item.deletedAt, RESOURCE_DATE_FORMAT) : ""),
  },
  { key: "purgesIn", sortable: false, title: "Retention", value: (item) => getPurgesInText(item.deletedAt) },
  { key: "actions", sortable: false, title: "Actions" },
];
