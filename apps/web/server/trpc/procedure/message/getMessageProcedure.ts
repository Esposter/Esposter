import type { RoomMessage } from "@esposter/db-schema";
import type { z } from "zod";

import { useRoomObject } from "#server/composables/realtime/useRoomObject";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { getNotFoundError } from "#server/trpc/guards/getNotFoundError";
import { getMemberProcedure } from "#server/trpc/procedure/room/getMemberProcedure";
import { MessageOperation } from "#shared/models/message/MessageOperation";
import { MessageOperationPermission } from "#shared/models/message/MessageOperationPermission";
import { checkIsMessageAuthor } from "#shared/services/message/checkIsMessageAuthor";
import { checkIsMessageOperationPermitted } from "#shared/services/message/checkIsMessageOperationPermitted";
import { getMessageOperationPermission } from "#shared/services/message/getMessageOperationPermission";
import { checkHasPermission } from "@esposter/db";
import { DatabaseEntityType, RoomPermission } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

// Each procedure names the operation it guards, and MessageTypeOperationPermissionMap answers both halves of the
// Guard from one declaration: whether the message's type supports that operation at all (a bad request for every
// Caller, including one holding RoomPermission.ManageMessages), and who may perform it (unauthorized otherwise).
// The message is read from its room's object, where a live message is held, so a deleted one is not found here.
// The procedure provides the message as the object held it when it was read
export const getMessageProcedure = <T extends z.ZodType<Pick<RoomMessage, "id"> & { roomId: string }>>(
  schema: T,
  operation: MessageOperation,
) =>
  getMemberProcedure(schema, "roomId").use(async ({ ctx, input, next }) => {
    const [message] = await useRoomObject(input.roomId).readMessagesByIds([input.id]);
    if (!message) throw getNotFoundError(DatabaseEntityType.Message, JSON.stringify(input));

    const permission = getMessageOperationPermission(message.type, operation);
    if (!permission)
      throw getInvalidOperationError(
        operation === MessageOperation.Delete ? Operation.Delete : Operation.Update,
        DatabaseEntityType.Message,
        JSON.stringify({ id: input.id, operation, roomId: input.roomId }),
      );
    // An any-member operation is already authorized by the membership check this procedure is built on, so it
    // Never pays for the permission read
    const hasManageMessages =
      permission === MessageOperationPermission.AnyMember
        ? false
        : await checkHasPermission(ctx.db, ctx.getSessionPayload.user.id, input.roomId, RoomPermission.ManageMessages);
    if (
      !checkIsMessageOperationPermitted(permission, {
        hasManageMessages,
        isAuthor: checkIsMessageAuthor(message, ctx.getSessionPayload.user.id),
      })
    )
      throw new TRPCError({ code: "UNAUTHORIZED" });
    return next({ ctx: { message } });
  });
