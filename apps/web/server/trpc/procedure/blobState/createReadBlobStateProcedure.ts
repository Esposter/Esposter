import type { StorageBucket } from "@esposter/db-schema";
import type { z } from "zod";

import { getUnreadableSaveError } from "#server/services/blobState/getUnreadableSaveError";
import { readBlobState } from "#server/services/blobState/readBlobState";
import { getBucket } from "#server/services/storage/getBucket";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { getSaveBlobName } from "@esposter/db-schema";
import { jsonDateParse } from "@esposter/shared";

// The server holds the save, so a save it cannot parse is an error rather than a fresh game: the client's next save
// Would write that fresh game over the one it could not read. The ETag is answered beside the model, the one the next
// Save is sent under. The rule: openspec/specs/architecture/persisted-data-latest-shape-only/design.md
export const createReadBlobStateProcedure = <TData, TInit>(
  container: StorageBucket,
  Model: new (init?: TInit) => TData,
  schema: z.ZodType<TInit>,
) =>
  standardAuthedProcedure.query<{ data: TData; etag?: string }>(async ({ ctx }) => {
    const bucket = getBucket(container);
    const { etag, json } = await readBlobState(bucket, getSaveBlobName(ctx.getSessionPayload.user.id));
    if (!json) return { data: new Model(), etag };

    const parsedSave = schema.safeParse(jsonDateParse(json.toString()));
    if (!parsedSave.success) {
      console.error(parsedSave.error);
      throw getUnreadableSaveError(parsedSave.error);
    }
    return { data: new Model(parsedSave.data), etag };
  });
