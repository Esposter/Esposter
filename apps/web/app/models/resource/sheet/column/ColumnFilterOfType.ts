import type { ColumnFilter } from "@/models/resource/sheet/column/ColumnFilter";

export type ColumnFilterOfType<T extends ColumnFilter["type"], F = ColumnFilter> = F extends { type: infer U }
  ? T extends U
    ? F
    : never
  : never;
