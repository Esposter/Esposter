import type { AzureContainer } from "@esposter/db-schema";

import { useContainerClient } from "#server/composables/azure/container/useContainerClient";
import { getSaveBlobName } from "#server/services/blobState/getSaveBlobName";
import { writeBlobState } from "#server/services/blobState/writeBlobState";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { z } from "zod";

// A save is sent under the ETag its last read or save returned, so a write over a save another session changed is a
// CONFLICT, which the client answers by reading again. An absent ETag saves only over no save at all
export const createSaveBlobStateProcedure = <TSchema extends z.ZodType>(container: AzureContainer, schema: TSchema) =>
  standardAuthedProcedure
    .input(z.object({ data: schema, etag: z.string().optional() }))
    .mutation<{ etag?: string }>(async ({ ctx, input }) => {
      const containerClient = await useContainerClient(container);
      const etag = await writeBlobState(
        containerClient,
        getSaveBlobName(ctx.getSessionPayload.user.id),
        JSON.stringify(input.data),
        input.etag,
      );
      return { etag };
    });
