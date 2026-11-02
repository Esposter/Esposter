import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { MoveWhiteboardElementInput } from "#shared/models/db/resource/whiteboard/MoveWhiteboardElementInput";
import type { UpdateResourceContentResult } from "#shared/models/resource/UpdateResourceContentResult";
import type { ResourceInResource } from "@esposter/db-schema";

import { applyResourceContentPatches } from "#server/services/resource/applyResourceContentPatches";
import { updateResourceContent } from "#server/services/resource/updateResourceContent";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { whiteboardResourceSchema } from "#shared/models/resource/whiteboard/WhiteboardResource";
import { ResourceType } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { movePositionedElement } from "headless-block-editor";

// The core's move, which reroutes each arrow bound to a moved shape in the same patch, saved as one write at the version
// Read. A whiteboard never saved holds no elements, so a move of it names none and is refused like any other index that moves nothing
export const moveWhiteboardElement = async (
  ctx: AuthedContext,
  resource: ResourceInResource,
  { contentVersion, index, point }: MoveWhiteboardElementInput,
): Promise<UpdateResourceContentResult> => {
  const { resource: savedResource, result: inverseOperations } = await updateResourceContent(
    ctx,
    resource,
    (storedContent) => {
      const document = whiteboardResourceSchema.parse(storedContent ?? { elements: [] });
      const operations = movePositionedElement(document, index, point);
      if (operations.length === 0)
        throw getInvalidOperationError(Operation.Update, "whiteboard", `element ${index} is not one that moves`);
      const { document: movedDocument, inverses } = applyResourceContentPatches(
        ResourceType.Whiteboard,
        document,
        operations,
      );
      return { content: movedDocument, result: inverses };
    },
    contentVersion,
  );
  return { contentVersion: savedResource.contentVersion, inverseOperations };
};
