import type { HostedAssetName } from "hosted-assets";

import { assertHostedAssetBytes } from "#src/services/hostedAssets/assertHostedAssetBytes";
import { FETCH_TIMEOUT_MS } from "#src/services/shared/constants";
import { readFileResponse } from "@esposter/shared";
import { getHostedAssetUrl } from "hosted-assets";

// Fetches one object anonymously from an origin and checks that the bytes it serves hash to the sha256 its name gives it.
// The bytes are hashed as served and never re-serialised, so a body that parses to the named value but is other bytes is
// Refused. A lock entry that records the object's decoded length is checked against it beside the hash, so a served object
// That hashes to its name but is another length is refused too. Resolves to the bytes, for a caller that reads them
export const verifyHostedAssetObject = async (
  baseUrl: string,
  name: HostedAssetName,
  lockedBytes?: number,
): Promise<Buffer> => {
  const url = getHostedAssetUrl(baseUrl, name);
  const bytes = Buffer.from(await (await readFileResponse(url, FETCH_TIMEOUT_MS)).arrayBuffer());
  assertHostedAssetBytes(url, name, bytes, lockedBytes);
  return bytes;
};
