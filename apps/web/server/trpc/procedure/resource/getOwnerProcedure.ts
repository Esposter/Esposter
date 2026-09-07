import type { ResourceType } from "@esposter/db-schema";
import type { z } from "zod";

import { requireOwnedResource } from "@@/server/services/resource/requireOwnedResource";
import { getInvalidOperationError } from "@@/server/trpc/guards/getInvalidOperationError";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { DatabaseEntityType } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";

export const getOwnerProcedure = <T extends z.ZodType>(
  type: ResourceType | undefined,
  schema: T,
  resourceIdKey: keyof z.infer<T>,
  isDeletedOnly = false,
) =>
  standardAuthedProcedure.input(schema).use(async ({ ctx, input, next }) => {
    const resourceId = (input as z.infer<T>)[resourceIdKey];
    if (typeof resourceId !== "string")
      throw getInvalidOperationError(Operation.Read, DatabaseEntityType.Resource, String(resourceId));

    const resource = await requireOwnedResource(ctx, resourceId, type, isDeletedOnly);
    return next({ ctx: { resource } });
  });
