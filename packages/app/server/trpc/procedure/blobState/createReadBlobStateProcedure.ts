// oxlint-disable typescript/no-unnecessary-type-assertion
import type { AzureContainer } from "@esposter/db-schema";

import { useDownload } from "@@/server/composables/azure/container/useDownload";
import { getSaveBlobName } from "@@/server/services/blobState/getSaveBlobName";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { getResultAsync, jsonDateParse, streamToText } from "@esposter/shared";
// The init parameter is typed never so every state class with an optional-init constructor is accepted —
// Their init types vary (Partial<X> vs PartialDeep<X>), which is what the `as never` below pays for.
export const createReadBlobStateProcedure = <TData>(container: AzureContainer, Model: new (init?: never) => TData) =>
  standardAuthedProcedure.query<TData>(({ ctx }) =>
    getResultAsync(async () => {
      const { readableStreamBody } = await useDownload(container, getSaveBlobName(ctx.getSessionPayload.user.id));
      if (!readableStreamBody) return new Model();
      const json = await streamToText(readableStreamBody);
      return new Model(jsonDateParse(json) as never);
    })
      .orTee(console.error)
      .unwrapOr(new Model()),
  );
