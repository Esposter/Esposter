import type { AzureContainer } from "@esposter/db-schema";

import { useContainerClient } from "#server/composables/azure/container/useContainerClient";
import { getSaveBlobName } from "#server/services/blobState/getSaveBlobName";
import { writeBlobState } from "#server/services/blobState/writeBlobState";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import type { z } from "zod";

// A save is sent under the ETag its last read or save returned, so a write over a save another session changed is a
// CONFLICT, which the client answers by reading again. An absent ETag saves only over no save at all
// The data is typed by its input and output as two parameters rather than by a generic schema, because a generic
// Schema's optional-key check stays deferred, and tRPC then types the input as possibly undefined
export const createSaveBlobStateProcedure = <TData, TDataInput>(
  container: AzureContainer,
  inputSchema: z.ZodType<{ data: TData; etag?: string }, { data: TDataInput; etag?: string }>,
) =>
  standardAuthedProcedure.input(inputSchema).mutation<{ etag?: string }>(async ({ ctx, input }) => {
    const containerClient = await useContainerClient(container);
    const etag = await writeBlobState(
      containerClient,
      getSaveBlobName(ctx.getSessionPayload.user.id),
      JSON.stringify(input.data),
      input.etag,
    );
    return { etag };
  });
