import type { ItemEntityType } from "@/shared/models/entity/ItemEntityType";

import { createItemEntityTypeSchema } from "@/shared/models/entity/ItemEntityType";
import { ATableEditorItemEntity, aTableEditorItemEntitySchema } from "@/shared/models/tableEditor/ATableEditorItemEntity";
import {
  VuetifyComponentItemType,
  vuetifyComponentItemTypeSchema,
} from "@/shared/models/tableEditor/vuetifyComponent/VuetifyComponentItemType";
import {
  VuetifyComponentType,
  vuetifyComponentTypeSchema,
} from "@/shared/models/tableEditor/vuetifyComponent/VuetifyComponentType";
import { z } from "zod";

export class VuetifyComponentItem extends ATableEditorItemEntity implements ItemEntityType<VuetifyComponentItemType> {
  component: VuetifyComponentType = VuetifyComponentType["v-alert"];
  props: Record<string, unknown> = {};
  type = VuetifyComponentItemType.VuetifyComponent;
}

export const vuetifyComponentItemSchema = aTableEditorItemEntitySchema
  .merge(createItemEntityTypeSchema(vuetifyComponentItemTypeSchema))
  .merge(
    z.object({ component: vuetifyComponentTypeSchema, props: z.record(z.string().min(1), z.unknown()) }),
  ) satisfies z.ZodType<VuetifyComponentItem>;
