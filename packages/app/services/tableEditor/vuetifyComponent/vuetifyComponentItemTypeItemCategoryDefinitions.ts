import type { ItemCategoryDefinition } from "@/models/tableEditor/ItemCategoryDefinition";
import type { Except } from "type-fest";

import { VuetifyComponentItem } from "@/models/tableEditor/vuetifyComponent/VuetifyComponentItem";
import { VuetifyComponentItemType } from "@/models/tableEditor/vuetifyComponent/VuetifyComponentItemType";
import { parseDictionaryToArray } from "@/util/parseDictionaryToArray";
import { prettify } from "@/util/text/prettify";

const VuetifyComponentItemTypeItemCategoryDefinitionMap = {
  [VuetifyComponentItemType.VuetifyComponent]: {
    create: () => new VuetifyComponentItem(),
    icon: "mdi-vuetify",
    targetTypeKey: "type",
    title: prettify(VuetifyComponentItemType.VuetifyComponent),
  },
} as const satisfies Record<VuetifyComponentItemType, Except<ItemCategoryDefinition<VuetifyComponentItem>, "value">>;

export const vuetifyComponentItemTypeItemCategoryDefinitions: ItemCategoryDefinition<VuetifyComponentItem>[] =
  parseDictionaryToArray(VuetifyComponentItemTypeItemCategoryDefinitionMap, "value");
