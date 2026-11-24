import type { SaveGenshinInput } from "#server/models/genshin/SaveGenshinInput";

import { writeBlobState } from "#server/services/blobState/writeBlobState";
import { checkIsGenshinSessionCurrent } from "#server/services/genshin/checkIsGenshinSessionCurrent";
import { getGenshinSessionReplacedError } from "#server/services/genshin/getGenshinSessionReplacedError";
import { readGenshinSaveState } from "#server/services/genshin/readGenshinSaveState";
import { writeGenshinSaveEnvelope } from "#server/services/genshin/writeGenshinSaveEnvelope";
import { getBucket } from "#server/services/storage/getBucket";
import { getSaveBlobName, StorageBucket } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export interface SaveGenshinResult {
  etag?: string | undefined;
  serverNow: string;
}

// The common save is one write under the ETag this session's last start or save returned.
// That ETag was minted by a write of this session, so a blob still carrying it is unchanged since.
// Its lease is still this session's, so nothing is read or parsed.
// A refused write is answered by one read.
// A write of this session that landed before is written over under the fresh ETag.
// Any other session's write is a replacement, and so is a second write refused in turn.
export const saveGenshin = async (
  userId: string,
  { etag, save, sessionId }: SaveGenshinInput,
): Promise<SaveGenshinResult> => {
  const bucket = getBucket(StorageBucket.GenshinAssets);
  const blobName = getSaveBlobName(userId);
  const writeSave = (readEtag: string) =>
    writeBlobState(bucket, blobName, JSON.stringify({ save, sessionId }), readEtag);
  const writtenEtag = await getResultAsync(() => writeSave(etag)).match(
    (written) => written,
    async (error) => {
      // A write refused under its ETag is the blob changed since it was read, the only CONFLICT writeBlobState throws
      if (!(error instanceof TRPCError) || error.code !== "CONFLICT") throw error;
      const { envelope, etag: currentEtag } = await readGenshinSaveState(bucket, userId);
      if (!currentEtag || !checkIsGenshinSessionCurrent(envelope, sessionId)) throw getGenshinSessionReplacedError();
      return writeGenshinSaveEnvelope(bucket, userId, { save, sessionId }, currentEtag);
    },
  );
  return { etag: writtenEtag, serverNow: Temporal.Now.instant().toString() };
};
