import type { z } from "zod";

import { AzureEntityType } from "#shared/models/azure/table/AzureEntityType";
import { useTableClient } from "@@/server/composables/azure/useTableClient";
import { AzureTable } from "@@/server/models/azure/table/AzureTable";
import { getEntity } from "@@/server/services/azure/table/getEntity";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { MessageEntity } from "@esposter/db";
import { NotFoundError } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const getCreatorProcedure = <T extends z.ZodType<Pick<MessageEntity, "partitionKey" | "rowKey">>>(schema: T) =>
  getMemberProcedure(schema, "partitionKey").use(async ({ ctx, input, next }) => {
    const messageClient = await useTableClient(AzureTable.Messages);
    const messageEntity = await getEntity(messageClient, MessageEntity, input.partitionKey, input.rowKey);
    if (!messageEntity)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: new NotFoundError(AzureEntityType.Message, JSON.stringify(input)).message,
      });
    else if (messageEntity.userId !== ctx.session.user.id) throw new TRPCError({ code: "UNAUTHORIZED" });
    return next({ ctx: { messageClient, messageEntity } });
  });
