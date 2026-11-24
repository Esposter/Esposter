import type { HostedAssetName } from "hosted-assets";

import { assertHostedAssetBytes } from "#src/services/hostedAssets/assertHostedAssetBytes";
import { FETCH_TIMEOUT_MS } from "#src/services/shared/constants";
import { readFileResponse } from "@esposter/shared";
import { getHostedAssetUrl } from "hosted-assets";

// Fetches one object anonymously from an origin.
// It checks that the bytes it serves hash to the sha256 its name gives.
// The bytes are hashed as served and never re-serialised.
// So a body that parses to the named value but is other bytes is refused.
// A lock entry that records the object's decoded length is checked against it beside the hash.
// So a served object that hashes to its name but is another length is refused too.
// Resolves to the bytes, for a caller that reads them.
// The timeout bounds the body read as well as the response.
// So a caller fetching large objects passes a longer one.
export const verifyHostedAssetObject = async (
  baseUrl: string,
  name: HostedAssetName,
  lockedBytes?: number,
  timeoutMs: number = FETCH_TIMEOUT_MS,
): Promise<Buffer> => {
  const url = getHostedAssetUrl(baseUrl, name);
  const bytes = Buffer.from(await (await readFileResponse(url, timeoutMs)).arrayBuffer());
  assertHostedAssetBytes(url, name, bytes, lockedBytes);
  return bytes;
};
