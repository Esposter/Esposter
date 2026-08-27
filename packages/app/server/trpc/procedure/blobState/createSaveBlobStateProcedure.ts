import type { AzureContainer } from "@esposter/db-schema";
import type { z } from "zod";

import { useUpload } from "@@/server/composables/azure/container/useUpload";
import { getSaveBlobName } from "@@/server/services/blobState/getSaveBlobName";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";

export const createSaveBlobStateProcedure = <TSchema extends z.ZodType>(container: AzureContainer, schema: TSchema) =>
  standardAuthedProcedure.input(schema).mutation<void>(async ({ ctx, input }) => {
    await useUpload(container, getSaveBlobName(ctx.getSessionPayload.user.id), JSON.stringify(input));
  });
