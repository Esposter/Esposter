import { AItemEntity } from "@/models/tableEditor/AItemEntity";
import type { ItemEntityType } from "@/models/tableEditor/ItemEntityType";
import { VuetifyComponentItemType } from "@/models/tableEditor/vuetifyComponent/VuetifyComponentItemType";
import { VuetifyComponentType } from "@/models/tableEditor/vuetifyComponent/VuetifyComponentType";

export class VuetifyComponentItem extends AItemEntity implements ItemEntityType<VuetifyComponentItemType> {
  type = VuetifyComponentItemType.VuetifyComponent;
  component: VuetifyComponentType[keyof VuetifyComponentType] = VuetifyComponentType["v-alert"];
  props: Record<string, unknown> = {};
}
