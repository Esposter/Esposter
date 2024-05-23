import { ATableEditorItemEntity, aTableEditorItemEntitySchema } from "@/models/tableEditor/ATableEditorItemEntity";
import type { ItemEntityType } from "@/models/tableEditor/ItemEntityType";
import { createItemEntityTypeSchema } from "@/models/tableEditor/ItemEntityType";
import {
  VuetifyComponentItemType,
  vuetifyComponentItemTypeSchema,
} from "@/models/tableEditor/vuetifyComponent/VuetifyComponentItemType";
import {
  VuetifyComponentType,
  vuetifyComponentTypeSchema,
} from "@/models/tableEditor/vuetifyComponent/VuetifyComponentType";
import { z } from "zod";

export class VuetifyComponentItem extends ATableEditorItemEntity implements ItemEntityType<VuetifyComponentItemType> {
  type = VuetifyComponentItemType.VuetifyComponent;
  component: VuetifyComponentType = VuetifyComponentType["v-alert"];
  props: Record<string, unknown> = {};
}

export const vuetifyComponentItemSchema = aTableEditorItemEntitySchema
  .merge(createItemEntityTypeSchema(vuetifyComponentItemTypeSchema))
  .merge(
    z.object({ component: vuetifyComponentTypeSchema, props: z.record(z.unknown()) }),
  ) satisfies z.ZodType<VuetifyComponentItem>;
