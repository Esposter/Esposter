import type { AzureContainer } from "@esposter/db-schema";
import type { z } from "zod";

import { useContainerClient } from "@@/server/composables/azure/container/useContainerClient";
import { getSaveBlobName } from "@@/server/services/blobState/getSaveBlobName";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { writeJsonBlob } from "@esposter/db";

export const createSaveBlobStateProcedure = <TSchema extends z.ZodType>(container: AzureContainer, schema: TSchema) =>
  standardAuthedProcedure.input(schema).mutation<void>(async ({ ctx, input }) => {
    const containerClient = await useContainerClient(container);
    await writeJsonBlob(containerClient, getSaveBlobName(ctx.getSessionPayload.user.id), JSON.stringify(input));
  });
