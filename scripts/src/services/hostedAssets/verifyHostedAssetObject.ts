import type { HostedAssetName } from "hosted-assets";

import { FETCH_TIMEOUT_MS } from "#src/services/shared/constants";
import { readFileResponse } from "@esposter/shared";
import { assertContentAddress, getContentAddress } from "@esposter/shared-node/cache";
import { getHostedAssetUrl } from "hosted-assets";

// Fetches one object anonymously from an origin and checks that the bytes it serves hash to the sha256 its name gives it.
// The bytes are hashed as served and never re-serialised, so a body that parses to the named value but is other bytes is
// Refused. Resolves to the bytes, for a caller that reads them
export const verifyHostedAssetObject = async (baseUrl: string, name: HostedAssetName): Promise<Buffer> => {
  const url = getHostedAssetUrl(baseUrl, name);
  const bytes = Buffer.from(await (await readFileResponse(url, FETCH_TIMEOUT_MS)).arrayBuffer());
  assertContentAddress(url, name.sha256, getContentAddress(bytes));
  return bytes;
};
