import type { Survey } from "#shared/db/schema/surveys";
import type { DataTableHeader } from "@/models/vuetify/DataTableHeader";

import { dayjs } from "#shared/services/dayjs";

export const surveyerHeaders: DataTableHeader[] = [
  { key: "name", title: "Name" },
  {
    key: "createdAt",
    title: "Created At",
    value: (item: Survey) => dayjs(item.createdAt).format("ddd, MMM D, YYYY h:mm A"),
  },
  {
    key: "updatedAt",
    title: "Updated At",
    value: (item: Survey) => dayjs(item.updatedAt).format("ddd, MMM D, YYYY h:mm A"),
  },
  { key: "actions", sortable: false, title: "Actions" },
];
