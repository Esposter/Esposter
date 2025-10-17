import type { MessageEntity } from "@esposter/db-schema";
import type { z } from "zod";

import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { getEntity } from "@esposter/db";
import { AzureEntityType, AzureTable, StandardMessageEntity } from "@esposter/db-schema";
import { NotFoundError } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const getCreatorProcedure = <T extends z.ZodType<Pick<MessageEntity, "partitionKey" | "rowKey">>>(schema: T) =>
  getMemberProcedure(schema, "partitionKey").use(async ({ ctx, input, next }) => {
    const messageClient = await useTableClient(AzureTable.Messages);
    const messageEntity = await getEntity(messageClient, StandardMessageEntity, input.partitionKey, input.rowKey);
    if (!messageEntity)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: new NotFoundError(AzureEntityType.Message, JSON.stringify(input)).message,
      });
    else if (messageEntity.userId !== ctx.session.user.id) throw new TRPCError({ code: "UNAUTHORIZED" });
    return next({ ctx: { messageClient, messageEntity } });
  });
