import type { BlueprintDeployment } from "#shared/models/resource/blueprint/BlueprintDeployment";
import type { Resource } from "@esposter/db-schema";

import { captureBlueprintInputSchema } from "#shared/models/db/blueprint/CaptureBlueprintInput";
import { deployBlueprintInputSchema } from "#shared/models/db/blueprint/DeployBlueprintInput";
import { blueprintResourceSchema } from "#shared/models/resource/blueprint/BlueprintResource";
import { captureBlueprint } from "@@/server/services/blueprint/captureBlueprint";
import { getInvalidBlueprintError } from "@@/server/services/blueprint/getInvalidBlueprintError";
import { deployBlueprint } from "@@/server/services/blueprint/deployBlueprint";
import { readResourceContent } from "@@/server/services/resource/readResourceContent";
import { router } from "@@/server/trpc";
import { createResourceProcedures } from "@@/server/trpc/procedure/resource/createResourceProcedures";
import { getOwnerProcedure } from "@@/server/trpc/procedure/resource/getOwnerProcedure";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { ResourceType } from "@esposter/db-schema";

export const blueprintRouter = router({
  ...createResourceProcedures(ResourceType.Blueprint),
  // Owner-gated capture reads other resources' content, so ownership of every id is verified in the service
  captureBlueprint: standardAuthedProcedure
    .input(captureBlueprintInputSchema)
    .mutation<Resource>(({ ctx, input: { ids, name } }) => captureBlueprint(ctx, ids, name)),
  deployBlueprint: getOwnerProcedure(ResourceType.Blueprint, deployBlueprintInputSchema, "id").mutation<
    BlueprintDeployment[]
  >(async ({ ctx, input: { parameterValues } }) => {
    const content = await readResourceContent(blueprintResourceSchema, ctx.resource.id);
    if (content === undefined) throw getInvalidBlueprintError("cannot deploy blueprint without content");

    return deployBlueprint(ctx, content, parameterValues);
  }),
});
