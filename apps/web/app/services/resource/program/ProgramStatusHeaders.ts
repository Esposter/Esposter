import type { ProgramStatusRow } from "#shared/models/resource/program/ProgramStatusRow";
import type { DataTableHeader } from "@/models/vuetify/DataTableHeader";

export const ProgramStatusHeaders: DataTableHeader<ProgramStatusRow>[] = [
  { key: "keyValue", title: "Participant" },
  { key: "addedAt", title: "Added" },
  { key: "isResponded", title: "Responded" },
];
