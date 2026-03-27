import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

import { NormalizeStringMode, NormalizeStringModes } from "@/models/tableEditor/file/commands/NormalizeStringMode";

export const NormalizeStringModeItemCategoryDefinitions: SelectItemCategoryDefinition<NormalizeStringMode>[] = [
  ...NormalizeStringModes,
].map((mode) => ({ title: mode, value: mode }));
