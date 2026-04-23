import type { AuthedContext } from "@@/server/models/auth/AuthedContext";

import { executeAdminActionInputSchema } from "#shared/models/db/moderation/ExecuteAdminActionInput";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { createEntity } from "@esposter/db";
import { AzureTable, getReverseTickedTimestamp, ModerationLogEntity } from "@esposter/db-schema";
import { initTRPC } from "@trpc/server";

const t = initTRPC.context<AuthedContext>().create();

export const moderationLogPlugin = t.procedure.use(async ({ ctx, getRawInput, next, type: procedureType }) => {
  const result = await next();
  if (!result.ok || procedureType !== "mutation") return result;

  const rawInput = await getRawInput();
  const parsedInput = executeAdminActionInputSchema.safeParse(rawInput);
  if (!parsedInput.success) return result;

  const { durationMs, roomId, targetUserId, type } = parsedInput.data;
  const moderationLogClient = await useTableClient(AzureTable.ModerationLog);
  await createEntity(
    moderationLogClient,
    new ModerationLogEntity({
      actorId: ctx.getSessionPayload.user.id,
      durationMs,
      partitionKey: roomId,
      rowKey: getReverseTickedTimestamp(),
      targetUserId,
      type,
    }),
  );

  return result;
});
