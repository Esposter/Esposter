import { AItemEntity, aItemEntitySchema } from "@/models/shared/AItemEntity";
import { createItemEntityTypeSchema, type ItemEntityType } from "@/models/tableEditor/ItemEntityType";
import {
  VuetifyComponentItemType,
  vuetifyComponentItemTypeSchema,
} from "@/models/tableEditor/vuetifyComponent/VuetifyComponentItemType";
// import { vuetifyComponentTypeSchema } from "@/models/tableEditor/vuetifyComponent/VuetifyComponentType";
import { z } from "zod";

export class VuetifyComponentItem extends AItemEntity implements ItemEntityType<VuetifyComponentItemType> {
  type = VuetifyComponentItemType.VuetifyComponent;
  // @TODO: We actually can't use this type because nuxt cannot load css in the server properly
  // component: VuetifyComponentType[keyof VuetifyComponentType] = VuetifyComponentType["v-alert"];
  component = "v-alert";
  props: Record<string, unknown> = {};
}

export const vuetifyComponentItemSchema = aItemEntitySchema
  .merge(createItemEntityTypeSchema(vuetifyComponentItemTypeSchema))
  .merge(z.object({ component: z.string(), props: z.record(z.unknown()) })) satisfies z.ZodType<VuetifyComponentItem>;
