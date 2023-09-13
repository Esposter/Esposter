import { AItemEntity, aItemEntitySchema } from "@/models/shared/AItemEntity";
import type { ItemEntityType } from "@/models/tableEditor/ItemEntityType";
import { createItemEntityTypeSchema } from "@/models/tableEditor/ItemEntityType";
import {
  VuetifyComponentItemType,
  vuetifyComponentItemTypeSchema,
} from "@/models/tableEditor/vuetifyComponent/VuetifyComponentItemType";
import { VuetifyComponentType } from "@/models/tableEditor/vuetifyComponent/VuetifyComponentType";

export class VuetifyComponentItem extends AItemEntity implements ItemEntityType<VuetifyComponentItemType> {
  type = VuetifyComponentItemType.VuetifyComponent;
  component: VuetifyComponentType[keyof VuetifyComponentType] = VuetifyComponentType["v-alert"];
  props: Record<string, unknown> = {};
}

export const vuetifyComponentItemSchema = aItemEntitySchema.merge(
  createItemEntityTypeSchema(vuetifyComponentItemTypeSchema),
);
