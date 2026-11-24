import type { HostedAssetRecord } from "#src/models/hostedAssets/HostedAssetRecord";

import { HOSTED_RECORD_EXTENSION } from "#src/services/hostedAssets/constants";
import { getContentAddress } from "@esposter/shared-node/cache";

// A record named by the sha256 of its compact JSON, so a value that serializes the same way on every machine is named
// The same way and a change of compression level never renames it
export const createHostedAssetRecord = (scope: string, value: unknown, isIndex: boolean): HostedAssetRecord => {
  const bytes = Buffer.from(JSON.stringify(value));
  return { bytes, extension: HOSTED_RECORD_EXTENSION, isIndex, scope, sha256: getContentAddress(bytes) };
};
