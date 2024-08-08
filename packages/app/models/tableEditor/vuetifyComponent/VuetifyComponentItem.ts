import type { ItemEntityType } from "@/models/shared/entity/ItemEntityType";

import { createItemEntityTypeSchema } from "@/models/shared/entity/ItemEntityType";
import { ATableEditorItemEntity, aTableEditorItemEntitySchema } from "@/models/tableEditor/ATableEditorItemEntity";
import {
  VuetifyComponentItemType,
  vuetifyComponentItemTypeSchema,
} from "@/models/tableEditor/vuetifyComponent/VuetifyComponentItemType";
// import { vuetifyComponentTypeSchema } from "@/models/tableEditor/vuetifyComponent/VuetifyComponentType";
import { z } from "zod";

export class VuetifyComponentItem extends ATableEditorItemEntity implements ItemEntityType<VuetifyComponentItemType> {
  // component: VuetifyComponentType[keyof VuetifyComponentType] = VuetifyComponentType["v-alert"];
  component = "v-alert";
  // @TODO: We actually can't use this type because nuxt cannot load css in the server properly
  props: Record<string, unknown> = {};
  type = VuetifyComponentItemType.VuetifyComponent;
}

export const vuetifyComponentItemSchema = aTableEditorItemEntitySchema
  .merge(createItemEntityTypeSchema(vuetifyComponentItemTypeSchema))
  .merge(z.object({ component: z.string(), props: z.record(z.unknown()) })) satisfies z.ZodType<VuetifyComponentItem>;
