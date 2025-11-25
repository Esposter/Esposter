import type { ItemEntityType, ToData } from "@esposter/shared";

import {
  ATableEditorItemEntity,
  aTableEditorItemEntitySchema,
} from "#shared/models/tableEditor/data/ATableEditorItemEntity";
import {
  VuetifyComponentItemType,
  vuetifyComponentItemTypeSchema,
} from "#shared/models/tableEditor/vuetifyComponent/VuetifyComponentItemType";
import {
  VuetifyComponentType,
  vuetifyComponentTypeSchema,
} from "#shared/models/tableEditor/vuetifyComponent/VuetifyComponentType";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export class VuetifyComponentItem extends ATableEditorItemEntity implements ItemEntityType<VuetifyComponentItemType> {
  component: VuetifyComponentType = VuetifyComponentType.VAlert;
  props: Record<string, unknown> = {};
  type = VuetifyComponentItemType.VuetifyComponent;
}

export const vuetifyComponentItemSchema = z.object({
  ...aTableEditorItemEntitySchema.shape,
  ...createItemEntityTypeSchema(vuetifyComponentItemTypeSchema).shape,
  component: vuetifyComponentTypeSchema,
  props: z.record(z.string().min(1), z.unknown()),
}) satisfies z.ZodType<ToData<VuetifyComponentItem>>;
