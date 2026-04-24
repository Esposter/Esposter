import type { MessageEntity } from "@esposter/db-schema";
import type { z } from "zod";

import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { hasPermission } from "@@/server/services/room/rbac/hasPermission";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { getEntity } from "@esposter/db";
import { AzureEntityType, AzureTable, MessageType, RoomPermission, StandardMessageEntity } from "@esposter/db-schema";
import { NotFoundError } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const getMessageProcedure = <T extends z.ZodType<Pick<MessageEntity, "partitionKey" | "rowKey">>>(schema: T) =>
  getMemberProcedure(schema, "partitionKey").use(async ({ ctx, input, next }) => {
    const messageClient = await useTableClient(AzureTable.Messages);
    const messageEntity = await getEntity(messageClient, StandardMessageEntity, input.partitionKey, input.rowKey);
    if (!messageEntity)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: new NotFoundError(AzureEntityType.Message, JSON.stringify(input)).message,
      });
    else if (
      !(
        (messageEntity.type === MessageType.Message && messageEntity.userId === ctx.getSessionPayload.user.id) ||
        (await hasPermission(ctx.db, ctx.getSessionPayload.user.id, input.partitionKey, RoomPermission.ManageMessages))
      )
    )
      throw new TRPCError({ code: "UNAUTHORIZED" });
    return next({ ctx: { messageClient, messageEntity } });
  });
