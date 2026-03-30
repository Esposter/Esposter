import type { ColumnStatDefinition } from "@/models/tableEditor/file/column/ColumnStatDefinition";
import type { ColumnStatKey } from "@/models/tableEditor/file/column/ColumnStatKey";

export const defineColumnStat = <T extends ColumnStatKey>(definition: ColumnStatDefinition<T>) => definition;
