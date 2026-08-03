import type { MessageEntity } from "@esposter/db-schema";
import type { z } from "zod";

import { MessageOperation } from "#shared/models/message/MessageOperation";
import { MessageOperationPermission } from "#shared/models/message/MessageOperationPermission";
import { getIsMessageOperationPermitted } from "#shared/services/message/getIsMessageOperationPermitted";
import { getMessageOperationPermission } from "#shared/services/message/getMessageOperationPermission";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { hasPermission } from "@@/server/services/room/rbac/hasPermission";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { getEntityWithEtag } from "@esposter/db";
import { AzureEntityType, AzureTable, RoomPermission, StandardMessageEntity } from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

// Each procedure names the operation it guards, and MessageTypeOperationPermissionMap answers both halves of the
// Guard from one declaration: whether the message's type supports that operation at all (a bad request for every
// Caller, including one holding RoomPermission.ManageMessages), and who may perform it (unauthorized otherwise).
export const getMessageProcedure = <T extends z.ZodType<Pick<MessageEntity, "partitionKey" | "rowKey">>>(
  schema: T,
  operation: MessageOperation,
) =>
  getMemberProcedure(schema, "partitionKey").use(async ({ ctx, input, next }) => {
    const messageClient = await useTableClient(AzureTable.Messages);
    // Read through the etag reader rather than getEntity, which drops it: every procedure built here already
    // Performs this read, so carrying the version it saw costs no extra round trip and is what lets a procedure
    // Whose write echoes back the whole message blob make that write conditional (see votePoll)
    const messageEntityWithEtag = await getEntityWithEtag(
      messageClient,
      StandardMessageEntity,
      input.partitionKey,
      input.rowKey,
    );
    if (!messageEntityWithEtag)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: new NotFoundError(AzureEntityType.Message, JSON.stringify(input)).message,
      });

    const { entity: messageEntity, etag: messageEtag } = messageEntityWithEtag;
    const permission = getMessageOperationPermission(messageEntity.type, operation);
    if (!permission)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: new InvalidOperationError(
          operation === MessageOperation.Delete ? Operation.Delete : Operation.Update,
          AzureEntityType.Message,
          JSON.stringify({ operation, partitionKey: input.partitionKey, rowKey: input.rowKey }),
        ).message,
      });
    // An any-member operation is already authorized by the membership check this procedure is built on, so it
    // Never pays for the permission read
    const hasManageMessages =
      permission === MessageOperationPermission.AnyMember
        ? false
        : await hasPermission(ctx.db, ctx.getSessionPayload.user.id, input.partitionKey, RoomPermission.ManageMessages);
    if (
      !getIsMessageOperationPermitted(permission, {
        hasManageMessages,
        isAuthor: messageEntity.userId === ctx.getSessionPayload.user.id,
      })
    )
      throw new TRPCError({ code: "UNAUTHORIZED" });
    return next({ ctx: { messageClient, messageEntity, messageEtag } });
  });
