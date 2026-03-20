import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

import { NormalizeStringMode } from "@/models/tableEditor/file/commands/NormalizeStringMode";

export const NormalizeStringModeItemCategoryDefinitions: SelectItemCategoryDefinition<NormalizeStringMode>[] =
  Object.values(NormalizeStringMode).map((mode) => ({ title: mode, value: mode }));
