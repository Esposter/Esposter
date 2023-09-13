import { AItemEntity, aItemEntitySchema } from "@/models/shared/AItemEntity";
import type { ItemEntityType } from "@/models/tableEditor/ItemEntityType";
import { createItemEntityTypeSchema } from "@/models/tableEditor/ItemEntityType";
import {
  VuetifyComponentItemType,
  vuetifyComponentItemTypeSchema,
} from "@/models/tableEditor/vuetifyComponent/VuetifyComponentItemType";

export class VuetifyComponentItem extends AItemEntity implements ItemEntityType<VuetifyComponentItemType> {
  type = VuetifyComponentItemType.VuetifyComponent;
  // @NOTE: We actually can't use this type because nuxt cannot load css in the server properly
  // VuetifyComponentType[keyof VuetifyComponentType] = VuetifyComponentType["v-alert"]
  component = "v-alert";
  props: Record<string, unknown> = {};
}

export const vuetifyComponentItemSchema = aItemEntitySchema.merge(
  createItemEntityTypeSchema(vuetifyComponentItemTypeSchema),
);
