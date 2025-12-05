import type { Session } from "#shared/models/auth/Session";
import type { Context } from "@@/server/trpc/context";

import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { createEntity } from "@esposter/db";
import { AzureTable, getReverseTickedTimestamp, UserActivityEntity } from "@esposter/db-schema";
import { initTRPC } from "@trpc/server";

const t = initTRPC.context<Context & { session: Session }>().create();

export const userActivityPlugin = t.procedure.use(async ({ ctx, next, path }) => {
  const result = await next();
  if (!result.ok) return result;

  const userAgent = ctx.req.headers["User-Agent"];
  const userActivitiesTableClient = await useTableClient(AzureTable.UserActivities);
  await createEntity(
    userActivitiesTableClient,
    new UserActivityEntity({
      partitionKey: ctx.session.user.id,
      rowKey: getReverseTickedTimestamp(),
      triggerPath: path,
      userAgent: typeof userAgent === "string" ? userAgent : "unknown",
    }),
  );
  return result;
});
