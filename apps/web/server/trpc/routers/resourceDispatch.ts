import type { Context } from "#server/trpc/context";
import type { ResourceIdInput } from "#shared/models/db/resource/ResourceIdInput";
import type { PublishableResourceType } from "#shared/models/resource/PublishableResourceType";
import type { ResourcePublicationInResource } from "@esposter/db-schema";

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
import { resourceIdInputSchema } from "#shared/models/db/resource/ResourceIdInput";
import { checkHasCapability } from "#shared/services/resource/checkHasCapability";
import { ResourceType } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";

// The publish procedure each publishable type's own router generates, called in process as the browser's per-type
// Router calls it, so the type's publish transform runs unchanged
interface PublishCaller {
  publishResource: (input: ResourceIdInput) => Promise<ResourcePublicationInResource>;
}

const publishCallers: Record<PublishableResourceType, (ctx: Context) => PublishCaller> = {
  [ResourceType.Dashboard]: (ctx) => createCallerFactory(dashboardRouter)(ctx),
  [ResourceType.Email]: (ctx) => createCallerFactory(emailRouter)(ctx),
  [ResourceType.Flowchart]: (ctx) => createCallerFactory(flowchartRouter)(ctx),
  [ResourceType.Note]: (ctx) => createCallerFactory(noteRouter)(ctx),
  [ResourceType.Survey]: (ctx) => createCallerFactory(surveyRouter)(ctx),
  [ResourceType.Webpage]: (ctx) => createCallerFactory(webpageRouter)(ctx),
};

// Typeless, so one tool serves a resource of any type: a type without the capability is refused in words before the
// Type's own procedure is reached
export const resourceDispatchRouter = router({
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
});
