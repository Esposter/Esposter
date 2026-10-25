import type { Context } from "#server/trpc/context";
import type { DeleteFileInput } from "#shared/models/db/resource/DeleteFileInput";
import type { GenerateUploadFileSasEntitiesInput } from "#shared/models/db/resource/GenerateUploadFileSasEntitiesInput";
import type { ResourceIdInput } from "#shared/models/db/resource/ResourceIdInput";
import type { FileAssetsResourceType } from "#shared/models/resource/FileAssetsResourceType";
import type { PublishableResourceType } from "#shared/models/resource/PublishableResourceType";
import type { ResourceFileSasEntity } from "#shared/models/resource/ResourceFileSasEntity";
import type { ResourceInResource, ResourcePublicationInResource } from "@esposter/db-schema";

import { createCallerFactory, router } from "#server/trpc";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { getOwnerProcedure } from "#server/trpc/procedure/resource/getOwnerProcedure";
import { dashboardRouter } from "#server/trpc/routers/dashboard";
import { emailRouter } from "#server/trpc/routers/email";
import { flowchartRouter } from "#server/trpc/routers/flowchart";
import { noteRouter } from "#server/trpc/routers/note";
import { surveyRouter } from "#server/trpc/routers/survey";
import { webpageRouter } from "#server/trpc/routers/webpage";
import { McpScope } from "#shared/models/auth/McpScope";
import { deleteFileInputSchema } from "#shared/models/db/resource/DeleteFileInput";
import { generateUploadFileSasEntitiesInputSchema } from "#shared/models/db/resource/GenerateUploadFileSasEntitiesInput";
import { resourceIdInputSchema } from "#shared/models/db/resource/ResourceIdInput";
import { checkHasCapability } from "#shared/services/resource/checkHasCapability";
import { ResourceType } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";

// The publish procedures each publishable type's own router generates, called in process as the browser's per-type
// Router calls them, so the type's publish transform runs unchanged
interface PublishCaller {
  publishResource: (input: ResourceIdInput) => Promise<ResourcePublicationInResource>;
  unpublishResource: (input: ResourceIdInput) => Promise<ResourceInResource>;
}

// The file procedures each type with file assets generates, called the same way
interface FileCaller {
  deleteFile: (input: DeleteFileInput) => Promise<void>;
  generateUploadFileSasEntities: (input: GenerateUploadFileSasEntitiesInput) => Promise<ResourceFileSasEntity[]>;
}

// The one record of every router the dispatch reaches, keyed by resource type; each router is named once, here
const resourceCallers = {
  [ResourceType.Dashboard]: (ctx: Context) => createCallerFactory(dashboardRouter)(ctx),
  [ResourceType.Email]: (ctx: Context) => createCallerFactory(emailRouter)(ctx),
  [ResourceType.Flowchart]: (ctx: Context) => createCallerFactory(flowchartRouter)(ctx),
  [ResourceType.Note]: (ctx: Context) => createCallerFactory(noteRouter)(ctx),
  [ResourceType.Survey]: (ctx: Context) => createCallerFactory(surveyRouter)(ctx),
  [ResourceType.Webpage]: (ctx: Context) => createCallerFactory(webpageRouter)(ctx),
};

const publishCallers: Record<PublishableResourceType, (ctx: Context) => PublishCaller> = resourceCallers;

const fileCallers: Record<FileAssetsResourceType, (ctx: Context) => FileCaller> = {
  [ResourceType.Email]: resourceCallers[ResourceType.Email],
  [ResourceType.Note]: resourceCallers[ResourceType.Note],
  [ResourceType.Survey]: resourceCallers[ResourceType.Survey],
  [ResourceType.Webpage]: resourceCallers[ResourceType.Webpage],
};

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
    })
    .mutation<void>(({ ctx, input }) => {
      const { type } = ctx.resource;
      if (!checkHasCapability(type, "fileAssets"))
        throw getInvalidOperationError(Operation.Update, type, "does not take files");
      return fileCallers[type](ctx).deleteFile(input);
    }),
  generateUploadFileSasEntities: getOwnerProcedure(undefined, generateUploadFileSasEntitiesInputSchema, "id")
    .meta({
      mcp: {
        description:
          "Ask for an address to upload a file to, named by the hash of its bytes, which stays valid for a short time. Send the file's bytes to its address with a PUT, then the file is held by the resource. A file the resource already holds answers with no address. Answers each file's address.",
        scope: McpScope.Resources,
      },
    })
    .mutation<ResourceFileSasEntity[]>(({ ctx, input }) => {
      const { type } = ctx.resource;
      if (!checkHasCapability(type, "fileAssets"))
        throw getInvalidOperationError(Operation.Read, type, "does not take files");
      return fileCallers[type](ctx).generateUploadFileSasEntities(input);
    }),
  publishResource: getOwnerProcedure(undefined, resourceIdInputSchema, "id")
    .meta({
      mcp: {
        description:
          "Publish a resource as its type publishes it, so its published address serves the content. A type that does not publish is refused. Answers the publication.",
        scope: McpScope.Resources,
      },
    })
    .mutation<ResourcePublicationInResource>(({ ctx, input }) => {
      const { type } = ctx.resource;
      if (!checkHasCapability(type, "publishable"))
        throw getInvalidOperationError(Operation.Update, type, "does not publish");
      return publishCallers[type](ctx).publishResource(input);
    }),
  unpublishResource: getOwnerProcedure(undefined, resourceIdInputSchema, "id")
    .meta({
      mcp: {
        description:
          "Take a published resource down, leaving its draft as it is. A type that does not publish is refused. Answers the resource.",
        scope: McpScope.Resources,
      },
    })
    .mutation<ResourceInResource>(({ ctx, input }) => {
      const { type } = ctx.resource;
      if (!checkHasCapability(type, "publishable"))
        throw getInvalidOperationError(Operation.Update, type, "does not publish");
      return publishCallers[type](ctx).unpublishResource(input);
    }),
});
