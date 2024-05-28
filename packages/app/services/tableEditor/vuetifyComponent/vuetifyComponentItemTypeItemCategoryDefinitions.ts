import type { ItemCategoryDefinition } from "@/models/tableEditor/ItemCategoryDefinition";
import { VuetifyComponentItem } from "@/models/tableEditor/vuetifyComponent/VuetifyComponentItem";
import { VuetifyComponentItemType } from "@/models/tableEditor/vuetifyComponent/VuetifyComponentItemType";
import { parseDictionaryToArray } from "@/util/parseDictionaryToArray";
import { prettifyName } from "@/util/text/prettifyName";
import type { Except } from "type-fest";

const VuetifyComponentItemTypeItemCategoryDefinitionMap = {
  [VuetifyComponentItemType.VuetifyComponent]: {
    title: prettifyName(VuetifyComponentItemType.VuetifyComponent),
    icon: "mdi-vuetify",
    targetTypeKey: "type",
    create: () => new VuetifyComponentItem(),
  },
} as const satisfies Record<VuetifyComponentItemType, Except<ItemCategoryDefinition<VuetifyComponentItem>, "value">>;

export const vuetifyComponentItemTypeItemCategoryDefinitions: ItemCategoryDefinition<VuetifyComponentItem>[] =
  parseDictionaryToArray(VuetifyComponentItemTypeItemCategoryDefinitionMap, "value");
