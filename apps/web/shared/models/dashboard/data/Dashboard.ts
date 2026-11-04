import type { Visual } from "#shared/models/dashboard/data/Visual";
import type { ToData } from "@esposter/shared";

import { visualSchema } from "#shared/models/dashboard/data/Visual";
import { AItemEntity, aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { MAX_VISUAL_GROUP_DEPTH } from "#shared/services/dashboard/constants";
import { listVisuals } from "#shared/services/dashboard/listVisuals";
import { MAX_RESOURCE_CONTENT_SIZE } from "#shared/services/resource/constants";
import { CollisionMode, CompactType } from "vue-grid-layout-headless";
import { z } from "zod";

export class Dashboard extends AItemEntity {
  // How the visuals pack, and what a drop does on the visual it lands on
  collision = CollisionMode.Push;
  compactType = CompactType.Vertical;
  visuals: Visual[] = [];

  constructor(init?: Partial<Dashboard>) {
    super();
    Object.assign(this, init);
  }
}

// oxlint-disable-next-line typescript/no-unsafe-enum-assignment -- the visual enums are the same declarations Visual.ts:28 names (VisualType.ts:4, chart/type/ChartType.ts:8); the rule flags a zod object nested in an array even on an exact enum match
export const dashboardSchema = z.object({
  ...aItemEntitySchema.shape,
  collision: z.enum(CollisionMode),
  compactType: z.enum(CompactType),
  // The tree checks what no single visual can see of the others: an id unique across every level, the visuals of the
  // Whole tree under the content limit, and no group nested deeper than the depth cap
  visuals: z
    .array(visualSchema)
    .max(MAX_RESOURCE_CONTENT_SIZE)
    .superRefine((visuals, context) => {
      const ids = listVisuals(visuals).map(({ id }) => id);
      if (new Set(ids).size !== ids.length) context.addIssue({ code: "custom", message: "Array items must be unique" });
      if (ids.length > MAX_RESOURCE_CONTENT_SIZE)
        context.addIssue({ code: "custom", message: "The visuals across every group exceed the content limit" });
      // Whether a group sits deeper than the depth cap, counted from the level given
      const checkIsGroupTooDeep = (levelVisuals: typeof visuals, depth: number): boolean =>
        levelVisuals.some(
          (visual) =>
            visual.visuals !== undefined &&
            (depth > MAX_VISUAL_GROUP_DEPTH || checkIsGroupTooDeep(visual.visuals, depth + 1)),
        );
      if (checkIsGroupTooDeep(visuals, 0))
        context.addIssue({ code: "custom", message: "A group nests deeper than the group depth allows" });
    }),
}) satisfies z.ZodType<ToData<Dashboard>>;
