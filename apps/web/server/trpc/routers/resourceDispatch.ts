import type { ResourceFilePresignedUrlEntity } from "#shared/models/resource/ResourceFilePresignedUrlEntity";
import type { ResourcePublicationInResource } from "@esposter/db-schema";

import { getPublishCaller } from "#server/services/resource/getPublishCaller";
import { fileCallers } from "#server/services/resource/resourceCallers";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { router } from "#server/trpc/index";
import { getOwnerProcedure } from "#server/trpc/procedure/resource/getOwnerProcedure";
import { deleteFileInputSchema } from "#shared/models/db/resource/DeleteFileInput";
import { generateUploadFilePresignedUrlEntitiesInputSchema } from "#shared/models/db/resource/GenerateUploadFilePresignedUrlEntitiesInput";
import { resourceIdInputSchema } from "#shared/models/db/resource/ResourceIdInput";
import { checkHasCapability } from "#shared/services/resource/checkHasCapability";
import { McpScope } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";

// Typeless, so one tool serves a resource of any type: the type decides whether the operation exists at all, and a type
// Without the capability is refused in words before the type's procedure is reached
export const resourceDispatchRouter = router({
  deleteFile: getOwnerProcedure(undefined, deleteFileInputSchema, "id")
    .meta({
      mcp: {
        description:
          "Remove a file from a resource by the hash it is stored under. The file leaves the resource and is released once no saved version names it. Answers nothing.",
        scope: McpScope.Resources,
      },
      staticReason: "Dispatches to the type's own procedure, which publishes the resource's topics",
    })
    .mutation<void>(({ ctx, input }) => {
      const { type } = ctx.resource;
      if (!checkHasCapability(type, "fileAssets"))
        throw getInvalidOperationError(Operation.Update, type, "does not take files");
      return fileCallers[type](ctx).deleteFile(input);
    }),
  generateUploadFilePresignedUrlEntities: getOwnerProcedure(
    undefined,
    generateUploadFilePresignedUrlEntitiesInputSchema,
    "id",
  )
    .meta({
      mcp: {
        description:
          "Ask for an address to upload a file to, named by the hash of its bytes, which stays valid for a short time. Send the file's bytes to its address with a PUT, then the file is held by the resource. A file the resource already holds answers with no address. Answers each file's address.",
        scope: McpScope.Resources,
      },
      staticReason: "The upload addresses of a file, which no reader shows until the file is saved",
    })
    .query<ResourceFilePresignedUrlEntity[]>(({ ctx, input }) => {
      const { type } = ctx.resource;
      if (!checkHasCapability(type, "fileAssets"))
        throw getInvalidOperationError(Operation.Read, type, "does not take files");
      return fileCallers[type](ctx).generateUploadFilePresignedUrlEntities(input);
    }),
  publishResource: getOwnerProcedure(undefined, resourceIdInputSchema, "id")
    .meta({
      mcp: {
        description:
          "Publish a resource as its type publishes it, so its published address serves the content. A type that does not publish is refused. Answers the publication.",
        scope: McpScope.Resources,
      },
      staticReason: "Dispatches to the type's own procedure, which publishes the resource's topics",
    })
    .mutation<ResourcePublicationInResource>(({ ctx, input }) =>
      getPublishCaller(ctx.resource.type, ctx).publishResource(input),
    ),
  unpublishResource: getOwnerProcedure(undefined, resourceIdInputSchema, "id")
    .meta({
      mcp: {
        description:
          "Take a published resource down, leaving its draft as it is. A type that does not publish is refused. Answers the removed publication, or nothing when the resource was not published.",
        scope: McpScope.Resources,
      },
      staticReason: "Dispatches to the type's own procedure, which publishes the resource's topics",
    })
    .mutation<ResourcePublicationInResource | undefined>(({ ctx, input }) =>
      getPublishCaller(ctx.resource.type, ctx).unpublishResource(input),
    ),
});
