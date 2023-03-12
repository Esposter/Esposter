import type { IItemType } from "@/models/tableEditor/IItemType";
import { Item } from "@/models/tableEditor/Item";
import { ItemType } from "@/models/tableEditor/ItemType";
import { VuetifyComponentType } from "@/models/tableEditor/vuetifyComponent/VuetifyComponentType";

export class VuetifyComponent extends Item implements IItemType<ItemType> {
  type = ItemType.VuetifyComponent;
  component: VuetifyComponentType[keyof VuetifyComponentType] = VuetifyComponentType["v-alert"];
}
