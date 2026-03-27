import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

import { NullStrategies, NullStrategy } from "@/models/tableEditor/file/commands/NullStrategy";

export const NullStrategyItemCategoryDefinitions: SelectItemCategoryDefinition<NullStrategy>[] = [
  ...NullStrategies,
].map((strategy) => ({ title: strategy, value: strategy }));
