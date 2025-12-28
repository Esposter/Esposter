import type { Session } from "#shared/models/auth/Session";
import type { Context } from "@@/server/trpc/context";

import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { createEntity } from "@esposter/db";
import { AzureTable, getReverseTickedTimestamp, UserActivityEntity } from "@esposter/db-schema";
import { initTRPC } from "@trpc/server";

const t = initTRPC.context<Context & { session: Session }>().create();

export const userActivityPlugin = t.procedure.use(async ({ ctx, next, path, type }) => {
  const result = await next();
  if (!result.ok) return result;

  const forwardedFor = ctx.req.headers["x-forwarded-for"] as string | undefined;
  const userActivitiesTableClient = await useTableClient(AzureTable.UserActivities);
  await createEntity(
    userActivitiesTableClient,
    new UserActivityEntity({
      acceptLanguage: ctx.req.headers["accept-language"],
      ipAddress: forwardedFor ? forwardedFor.split(",")[0].trim() : ctx.req.socket.remoteAddress,
      partitionKey: ctx.session.user.id,
      referer: ctx.req.headers.referer,
      rowKey: getReverseTickedTimestamp(),
      triggerPath: path,
      type,
      userAgent: ctx.req.headers["user-agent"],
    }),
  );
  return result;
});
