import type { LayoutItem } from "#shared/models/dashboard/data/LayoutItem";
import type { VisualDatasetBinding } from "#shared/models/dashboard/data/VisualDatasetBinding";
import type { ItemEntityType, ToData } from "@esposter/shared";

import { Chart, chartSchema } from "#shared/models/dashboard/data/chart/Chart";
import { layoutItemSchema } from "#shared/models/dashboard/data/LayoutItem";
import { visualDatasetBindingSchema } from "#shared/models/dashboard/data/VisualDatasetBinding";
import { VisualType, visualTypeSchema } from "#shared/models/dashboard/data/VisualType";
import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { MAX_RESOURCE_CONTENT_SIZE } from "#shared/services/resource/constants";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export class Visual extends AItemEntity implements ItemEntityType<VisualType>, LayoutItem {
  chart = new Chart();
  dataset?: VisualDatasetBinding;
  h = 4;
  // Whether the visual takes its rows from the content it draws, rather than from its saved span
  isAutoHeight = false;
  type = VisualType.Area;
  // The visuals a group holds, on a grid of its own. Absent on every other type, and a group always holds one
  visuals?: Visual[];
  w = 4;
  x = 0;
  y = 0;

  constructor(init?: Partial<Visual>) {
    super();
    Object.assign(this, init);
  }
}

// oxlint-disable-next-line typescript/no-unsafe-enum-assignment -- VisualType (VisualType.ts:4) and the chart enums (chart/type/ChartType.ts:8) are the same declarations on both sides; the rule flags a nested zod shape even on an exact enum match
export const visualSchema = z
  .object({
    ...aItemEntitySchema.shape,
    ...createItemEntityTypeSchema(visualTypeSchema).shape,
    ...layoutItemSchema.shape,
    chart: chartSchema,
    dataset: visualDatasetBindingSchema.optional(),
    isAutoHeight: z.boolean(),
    // A group's visuals are this schema again, so the tree nests by reference. The return type is written out because
    // The schema's own type is what the getter is part of, so it cannot be inferred
    get visuals(): z.ZodOptional<z.ZodArray<z.ZodType<ToData<Visual>>>> {
      return z.array(visualSchema).max(MAX_RESOURCE_CONTENT_SIZE).optional();
    },
  })
  .superRefine((visual, context) => {
    // A group holds visuals and takes no dataset binding, and every other type holds no visuals
    if (visual.type === VisualType.Group) {
      if (visual.visuals === undefined)
        context.addIssue({ code: "custom", message: "A group must hold its visuals", path: ["visuals"] });
      if (visual.dataset !== undefined)
        context.addIssue({ code: "custom", message: "A group takes no dataset binding", path: ["dataset"] });
    } else if (visual.visuals !== undefined)
      context.addIssue({ code: "custom", message: "Only a group may hold visuals", path: ["visuals"] });
  }) satisfies z.ZodType<ToData<Visual>>;
