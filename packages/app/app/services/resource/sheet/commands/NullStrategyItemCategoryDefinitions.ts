import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

import { NullStrategies, NullStrategy } from "@/models/resource/sheet/commands/NullStrategy";

export const NullStrategyItemCategoryDefinitions: SelectItemCategoryDefinition<NullStrategy>[] = Array.from(
  NullStrategies,
  (strategy) => ({ title: strategy, value: strategy }),
);
