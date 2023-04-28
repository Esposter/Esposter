import { AItemEntity } from "@/models/tableEditor/AItemEntity";
import type { ItemEntityType } from "@/models/tableEditor/ItemEntityType";
import { ItemType } from "@/models/tableEditor/ItemType";
import { VuetifyComponentType } from "@/models/tableEditor/vuetifyComponent/VuetifyComponentType";

export class VuetifyComponent extends AItemEntity implements ItemEntityType<ItemType> {
  type = ItemType.VuetifyComponent;
  component: VuetifyComponentType[keyof VuetifyComponentType] = VuetifyComponentType["v-alert"];
  props: Record<string, unknown> = {};
}
