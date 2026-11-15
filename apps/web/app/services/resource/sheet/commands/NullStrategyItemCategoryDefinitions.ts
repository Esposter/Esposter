import type { NullStrategy } from "#src/models/resource/sheet/commands/NullStrategy";
import type { SelectItemCategoryDefinition } from "#src/models/shared/SelectItemCategoryDefinition";

import { NullStrategies } from "#src/models/resource/sheet/commands/NullStrategy";

export const NullStrategyItemCategoryDefinitions: SelectItemCategoryDefinition<NullStrategy>[] = Array.from(
  NullStrategies,
  (strategy) => ({ title: strategy, value: strategy }),
);
