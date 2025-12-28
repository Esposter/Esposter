import type { ItemCategoryDefinition } from "@/models/tableEditor/ItemCategoryDefinition";
import type { Except } from "type-fest";

import { VuetifyComponentItem } from "#shared/models/tableEditor/vuetifyComponent/VuetifyComponentItem";
import { VuetifyComponentItemType } from "#shared/models/tableEditor/vuetifyComponent/VuetifyComponentItemType";
import { parseDictionaryToArray } from "#shared/util/parseDictionaryToArray";
import { prettify } from "@/util/text/prettify";
import { ItemEntityTypePropertyNames } from "@esposter/shared";

const VuetifyComponentItemTypeItemCategoryDefinitionMap = {
  [VuetifyComponentItemType.VuetifyComponent]: {
    create: () => new VuetifyComponentItem(),
    icon: "mdi-vuetify",
    targetTypeKey: ItemEntityTypePropertyNames.type,
    title: prettify(VuetifyComponentItemType.VuetifyComponent),
  },
} as const satisfies Record<VuetifyComponentItemType, Except<ItemCategoryDefinition<VuetifyComponentItem>, "value">>;

export const VuetifyComponentItemTypeItemCategoryDefinitions: ItemCategoryDefinition<VuetifyComponentItem>[] =
  parseDictionaryToArray(VuetifyComponentItemTypeItemCategoryDefinitionMap, "value");
