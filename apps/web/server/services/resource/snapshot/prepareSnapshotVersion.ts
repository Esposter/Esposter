import type { Context } from "#server/trpc/context";
import type { ResourceInResource } from "@esposter/db-schema";
import type { WrittenVersion } from "keyframe-store";

import { createSnapshotKeyframeStore } from "#server/services/resource/snapshot/createSnapshotKeyframeStore";
import { getSnapshotAssetHashes } from "#server/services/resource/snapshot/getSnapshotAssetHashes";
import { getSnapshotSummary } from "#server/services/resource/snapshot/getSnapshotSummary";
import { getSnapshotUrlAssetHashes } from "#server/services/resource/snapshot/getSnapshotUrlAssetHashes";
import { readReferencedAssetHashes } from "#server/services/resource/snapshot/readReferencedAssetHashes";
import { readSnapshotAnchor } from "#server/services/resource/snapshot/readSnapshotAnchor";
import { touchSnapshotAssets } from "#server/services/resource/snapshot/touchSnapshotAssets";
import { DatabaseEntityType, SnapshotChannel } from "@esposter/db-schema";
import { InvalidOperationError, jsonDateParse, Operation } from "@esposter/shared";

export interface PreparedSnapshotVersion {
  assetHashes: Set<string>;
  summary: string;
  writtenVersion: WrittenVersion;
}

// The blob side of a version write: the content goes into the store against the channel's current anchor, and the assets
// it names are touched, refused or kept. Nothing here writes a row. The caller writes the row in one batch after this
// returns, so a version is never visible before its object is stored. A published version is what a reader is served,
// so it is refused while a url of this resource's own file names one the store does not hold. A bare id is never refused,
// since a 64-hex token can be a digest in text rather than a file. Any other channel keeps what the user wrote, since a
// revision or a restore naming a gone file is data rather than a broken page. A touch restarts the grace window of an
// asset nothing references, so only the assets no row of the resource names are touched, which keeps a document of pasted
// digests at one touch each the first time rather than on every write
export const prepareSnapshotVersion = async (
  db: Context["db"],
  resource: Pick<ResourceInResource, "id" | "type">,
  channel: SnapshotChannel,
  serializedContent: string,
): Promise<PreparedSnapshotVersion> => {
  const { id } = resource;
  const keyframeStore = await createSnapshotKeyframeStore(id);
  const summary = getSnapshotSummary(resource.type, serializedContent);
  const assetHashes = getSnapshotAssetHashes(serializedContent);
  const urlAssetHashes = getSnapshotUrlAssetHashes(id, jsonDateParse(serializedContent));
  const referencedAssetHashes = await readReferencedAssetHashes(db, id);
  // A url of the resource's own file is asked of the store whatever names it, because the refusal needs its answer
  const touchedAssetHashes = new Set([
    ...urlAssetHashes,
    ...[...assetHashes].filter((assetHash) => !referencedAssetHashes.has(assetHash)),
  ]);
  const missingAssetHashes = await touchSnapshotAssets(id, touchedAssetHashes);
  const isUrlAssetMissing = [...urlAssetHashes].some((assetHash) => missingAssetHashes.has(assetHash));
  if (channel === SnapshotChannel.Published && isUrlAssetMissing)
    throw new InvalidOperationError(
      Operation.Create,
      DatabaseEntityType.Resource,
      "cannot store content naming a missing asset",
    );
  const anchor = await readSnapshotAnchor(db, id, channel);
  const writtenVersion = await keyframeStore.write(Buffer.from(serializedContent), anchor).match(
    (value) => value,
    (error) => {
      throw error;
    },
  );
  return { assetHashes, summary, writtenVersion };
};
