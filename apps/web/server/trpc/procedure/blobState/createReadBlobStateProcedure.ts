import type { AzureContainer } from "@esposter/db-schema";

import { useContainerClient } from "#server/composables/azure/container/useContainerClient";
import { getSaveBlobName } from "#server/services/blobState/getSaveBlobName";
import { readBlobState } from "#server/services/blobState/readBlobState";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { getResult, jsonDateParse } from "@esposter/shared";

// The init parameter is typed never so every state class with an optional-init constructor is accepted —
// Their init types vary (Partial<X> vs PartialDeep<X>), which is what the `as never` below pays for.
// Only a save that no longer parses resets to a fresh game (/docs/architecture/persisted-data-latest-shape-only). A
// Read that fails surfaces instead: answered with a fresh game, the client's next autosave would overwrite the save
// It could not read. The ETag is answered beside the model, the one the next save is sent under
export const createReadBlobStateProcedure = <TData>(container: AzureContainer, Model: new (init?: never) => TData) =>
  standardAuthedProcedure.query<{ data: TData; etag?: string }>(async ({ ctx }) => {
    const containerClient = await useContainerClient(container);
    const { etag, json } = await readBlobState(containerClient, getSaveBlobName(ctx.getSessionPayload.user.id));
    if (!json) return { data: new Model(), etag };
    // oxlint-disable-next-line typescript/no-unnecessary-type-assertion -- `any` is not assignable to `never`
    const data = getResult(() => new Model(jsonDateParse(json.toString()) as never))
      .orTee(console.error)
      .unwrapOr(new Model());
    return { data, etag };
  });
