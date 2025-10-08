import type { DataTableHeader } from "@/models/vuetify/DataTableHeader";
import type { Survey } from "@esposter/db";

import { dayjs } from "#shared/services/dayjs";
import { ItemMetadataPropertyNames } from "@esposter/shared";

export const SurveyHeaders: DataTableHeader<Survey>[] = [
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
