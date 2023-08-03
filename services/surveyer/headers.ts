import type { DataTableHeader } from "@/models/vuetify/DataTableHeader";

export const surveyerHeaders: DataTableHeader[] = [
  { title: "Name", key: "name" },
  { title: "Created At", key: "createdAt" },
  { title: "Updated At", key: "updatedAt" },
  { title: "Actions", key: "actions", sortable: false },
];
