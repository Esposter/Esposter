import type { UpdateResourceContentResult } from "#shared/models/resource/UpdateResourceContentResult";

import { moveWhiteboardElement } from "#server/services/resource/whiteboard/moveWhiteboardElement";
import { router } from "#server/trpc";
import { createResourceProcedures } from "#server/trpc/procedure/resource/createResourceProcedures";
import { getOwnerProcedure } from "#server/trpc/procedure/resource/getOwnerProcedure";
import { McpScope } from "#shared/models/auth/McpScope";
import { moveWhiteboardElementInputSchema } from "#shared/models/db/resource/whiteboard/MoveWhiteboardElementInput";
import { ResourceType } from "@esposter/db-schema";

export const whiteboardRouter = router({
  ...createResourceProcedures(ResourceType.Whiteboard),
  // The one typed write a whiteboard takes beside the generic patch: a patch moves a shape but cannot reroute the arrows bound
  // To it, so the move names the shape and its point and the arrows follow in the same save
  moveWhiteboardElement: getOwnerProcedure(ResourceType.Whiteboard, moveWhiteboardElementInputSchema, "id")
    .meta({
      mcp: {
        description:
          "Move a whiteboard's element to a point, by its index in the element list, with each arrow bound to a moved shape rerouted in the same write. A shape, an image, a sticky note, a text or a stroke moves, and an arrow moves its free ends while a bound end follows its shape; an arrow bound at both ends holds no position of its own and is refused. Pass the contentVersion you read and the move is refused if the whiteboard changed since. Answers the new contentVersion and the operations that undo the move.",
        scope: McpScope.Resources,
      },
    })
    .mutation<UpdateResourceContentResult>(({ ctx, input }) => moveWhiteboardElement(ctx, ctx.resource, input)),
});
