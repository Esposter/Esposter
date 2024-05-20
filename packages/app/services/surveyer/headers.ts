import type { Survey } from "@/db/schema/surveys";
import type { DataTableHeader } from "@/models/vuetify/DataTableHeader";
import { dayjs } from "@/services/dayjs";

export const surveyerHeaders: DataTableHeader[] = [
  { title: "Name", key: "name" },
  {
    title: "Created At",
    key: "createdAt",
    value: (item: Survey) => dayjs(item.createdAt).format("ddd, MMM D, YYYY h:mm A"),
  },
  {
    title: "Updated At",
    key: "updatedAt",
    value: (item: Survey) => dayjs(item.updatedAt).format("ddd, MMM D, YYYY h:mm A"),
  },
  { title: "Actions", key: "actions", sortable: false },
];
