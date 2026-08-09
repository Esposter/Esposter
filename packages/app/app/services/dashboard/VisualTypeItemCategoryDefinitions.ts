import type { VisualType } from "#shared/models/dashboard/data/VisualType";
import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

import { VisualTypes } from "#shared/models/dashboard/data/VisualType";
import { prettify } from "@/util/text/prettify";

// Every visual type is offered and none overrides its title, so the enum itself is the item list
export const VisualTypeItemCategoryDefinitions: SelectItemCategoryDefinition<VisualType>[] = Array.from(
  VisualTypes,
  (visualType) => ({ title: prettify(visualType), value: visualType }),
);
