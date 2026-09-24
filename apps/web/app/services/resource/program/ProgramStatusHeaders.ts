import type { ProgramStatusRow } from "#shared/models/resource/program/ProgramStatusRow";
import type { UiDataTableColumn } from "@/models/ui/UiDataTableColumn";

export const ProgramStatusHeaders: UiDataTableColumn<ProgramStatusRow & { id: string }>[] = [
  { key: "keyValue", title: "Participant" },
  {
    compare: (firstRow, secondRow) => firstRow.addedAt.getTime() - secondRow.addedAt.getTime(),
    key: "addedAt",
    title: "Added",
  },
  {
    compare: (firstRow, secondRow) => Number(firstRow.isResponded) - Number(secondRow.isResponded),
    key: "isResponded",
    title: "Responded",
  },
];
