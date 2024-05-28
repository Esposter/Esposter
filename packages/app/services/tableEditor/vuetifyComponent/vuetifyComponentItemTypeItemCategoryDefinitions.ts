import type { ItemCategoryDefinition } from "@/models/tableEditor/ItemCategoryDefinition";
import { VuetifyComponentItem } from "@/models/tableEditor/vuetifyComponent/VuetifyComponentItem";
import { VuetifyComponentItemType } from "@/models/tableEditor/vuetifyComponent/VuetifyComponentItemType";
import { prettifyName } from "@/util/text/prettifyName";

export const vuetifyComponentItemTypeItemCategoryDefinitions: ItemCategoryDefinition<VuetifyComponentItem>[] = [
  {
    value: VuetifyComponentItemType.VuetifyComponent,
    title: prettifyName(VuetifyComponentItemType.VuetifyComponent),
    icon: "mdi-vuetify",
    targetTypeKey: "type",
    create: () => new VuetifyComponentItem(),
  },
];
