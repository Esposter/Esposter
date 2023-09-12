import { AItemEntity, aItemEntitySchema } from "@/models/shared/AItemEntity";
import { createItemEntityTypeSchema, type ItemEntityType } from "@/models/tableEditor/ItemEntityType";
import {
  VuetifyComponentItemType,
  vuetifyComponentItemTypeSchema,
} from "@/models/tableEditor/vuetifyComponent/VuetifyComponentItemType";
import { VuetifyComponentType } from "@/models/tableEditor/vuetifyComponent/VuetifyComponentType";
import { RegisterSuperJSON } from "@/services/superjson/RegisterSuperJSON";

export class VuetifyComponentItem extends AItemEntity implements ItemEntityType<VuetifyComponentItemType> {
  type = VuetifyComponentItemType.VuetifyComponent;
  component: VuetifyComponentType[keyof VuetifyComponentType] = VuetifyComponentType["v-alert"];
  props: Record<string, unknown> = {};
}

export const vuetifyComponentItemSchema = aItemEntitySchema.merge(
  createItemEntityTypeSchema(vuetifyComponentItemTypeSchema),
);

// Change this to use class decorators when it is supported
// https://github.com/nuxt/nuxt/issues/14126
RegisterSuperJSON(VuetifyComponentItem);
