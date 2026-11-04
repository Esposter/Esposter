import type { AzureContainer } from "@esposter/db-schema";
import type { z } from "zod";

import { useContainerClient } from "#server/composables/azure/container/useContainerClient";
import { readBlobState } from "#server/services/blobState/readBlobState";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { getSaveBlobName } from "@esposter/db-schema";
import { jsonDateParse } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

// The server holds the save, so a save it cannot parse is an error rather than a fresh game: the client's next save
// Would write that fresh game over the one it could not read. The rule is in
// openspec/specs/architecture/persisted-data-latest-shape-only/design.md. The ETag is answered beside the model, the one
// The next save is sent under
export const createReadBlobStateProcedure = <TData, TInit>(
  container: AzureContainer,
  Model: new (init?: TInit) => TData,
  schema: z.ZodType<TInit>,
) =>
  standardAuthedProcedure.query<{ data: TData; etag?: string }>(async ({ ctx }) => {
    const containerClient = await useContainerClient(container);
    const { etag, json } = await readBlobState(containerClient, getSaveBlobName(ctx.getSessionPayload.user.id));
    if (!json) return { data: new Model(), etag };

    const parsedSave = schema.safeParse(jsonDateParse(json.toString()));
    if (!parsedSave.success) {
      console.error(parsedSave.error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The saved game could not be read" });
    }
    return { data: new Model(parsedSave.data), etag };
  });
