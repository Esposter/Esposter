import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

import { NullStrategy } from "@/models/tableEditor/file/commands/NullStrategy";

export const NullStrategyItemCategoryDefinitions: SelectItemCategoryDefinition<NullStrategy>[] = Object.values(
  NullStrategy,
).map((strategy) => ({ title: strategy, value: strategy }));
