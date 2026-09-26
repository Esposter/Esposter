import type { Transaction } from "@@/server/models/db/Transaction";
import type { Resource } from "@esposter/db-schema";

import { STALE_CONTENT_VERSION_ERROR_MESSAGE } from "#shared/services/resource/constants";
import { resources } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

// The version check every owner save runs inside its content write, whichever transport carried the document
export const getUpdateContentVersion =
  (id: Resource["id"], contentVersion: Resource["contentVersion"]) =>
  async (tx: Transaction): Promise<Resource> => {
    // The version check is part of the UPDATE so concurrent saves cannot both pass and silently lose one write
    const savedResource = (
      await tx
        .update(resources)
        .set({ contentVersion: contentVersion + 1 })
        .where(and(eq(resources.id, id), eq(resources.contentVersion, contentVersion)))
        .returning()
    )[0];
    if (!savedResource) throw new TRPCError({ code: "BAD_REQUEST", message: STALE_CONTENT_VERSION_ERROR_MESSAGE });

    return savedResource;
  };
