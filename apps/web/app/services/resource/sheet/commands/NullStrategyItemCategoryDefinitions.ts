import type { NullStrategy } from "@/models/resource/sheet/commands/NullStrategy";
import type { SelectItemCategoryDefinition } from "@/models/shared/SelectItemCategoryDefinition";

import { NullStrategies } from "@/models/resource/sheet/commands/NullStrategy";

export const NullStrategyItemCategoryDefinitions: SelectItemCategoryDefinition<NullStrategy>[] = Array.from(
  NullStrategies,
  (strategy) => ({ title: strategy, value: strategy }),
);
