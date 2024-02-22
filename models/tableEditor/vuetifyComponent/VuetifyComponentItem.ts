import { ATableEditorItemEntity, aTableEditorItemEntitySchema } from "@/models/tableEditor/ATableEditorItemEntity";
import { createItemEntityTypeSchema } from "@/models/tableEditor/ItemEntityType";
import type { ItemEntityType } from "@/models/tableEditor/ItemEntityType";
import {
  VuetifyComponentItemType,
  vuetifyComponentItemTypeSchema,
} from "@/models/tableEditor/vuetifyComponent/VuetifyComponentItemType";
// import { vuetifyComponentTypeSchema } from "@/models/tableEditor/vuetifyComponent/VuetifyComponentType";
import { z } from "zod";

export class VuetifyComponentItem extends ATableEditorItemEntity implements ItemEntityType<VuetifyComponentItemType> {
  type = VuetifyComponentItemType.VuetifyComponent;
  // @TODO: We actually can't use this type because nuxt cannot load css in the server properly
  // component: VuetifyComponentType[keyof VuetifyComponentType] = VuetifyComponentType["v-alert"];
  component = "v-alert";
  props: Record<string, unknown> = {};
}

export const vuetifyComponentItemSchema = aTableEditorItemEntitySchema
  .merge(createItemEntityTypeSchema(vuetifyComponentItemTypeSchema))
  .merge(z.object({ component: z.string(), props: z.record(z.unknown()) })) satisfies z.ZodType<VuetifyComponentItem>;
