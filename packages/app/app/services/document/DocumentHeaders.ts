import type { DataTableHeader } from "@/models/vuetify/DataTableHeader";
import type { Document } from "@esposter/db-schema";

import { dayjs } from "#shared/services/dayjs";
import { ItemMetadataPropertyNames } from "@esposter/shared";

export const DocumentHeaders: DataTableHeader<Document>[] = [
  { key: "type", title: "Type" },
  { key: "name", title: "Name" },
  { key: "publishedAt", title: "Status" },
  {
    key: ItemMetadataPropertyNames.updatedAt,
    title: "Updated At",
    value: (item) => dayjs(item.updatedAt).format("ddd, MMM D, YYYY h:mm A"),
  },
  { key: "actions", sortable: false, title: "Actions" },
];
