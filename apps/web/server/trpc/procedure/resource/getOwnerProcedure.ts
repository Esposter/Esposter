import type { ResourceType } from "@esposter/db-schema";
import type { inferParser } from "@trpc/server/unstable-core-do-not-import";
import type { z } from "zod";

import { requireOwnedResource } from "@@/server/services/resource/requireOwnedResource";
import { requireUuid } from "@@/server/trpc/guards/requireUuid";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { DatabaseEntityType } from "@esposter/db-schema";

export const getOwnerProcedure = <T extends z.ZodType>(
  type: ResourceType | undefined,
  schema: T,
  resourceIdKey: keyof inferParser<T>["out"],
  isDeletedOnly = false,
) =>
  standardAuthedProcedure.input(schema).use(async ({ ctx, input, next }) => {
    const resourceId = requireUuid(input[resourceIdKey], DatabaseEntityType.Resource);
    const resource = await requireOwnedResource(ctx, resourceId, type, isDeletedOnly);
    return next({ ctx: { resource } });
  });
