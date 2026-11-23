import { getContentAddress } from "@esposter/shared-node/cache";
import { getHostedAssetUrl } from "hosted-assets";
import { describe } from "vitest";

// A JSON record named by the hash of its own compact bytes, and stored under the scope it is published under
export const createStoredHostedAssetRecord = (baseUrl: string, scope: string, value: unknown) => {
  const json = JSON.stringify(value);
  const sha256 = getContentAddress(Buffer.from(json));
  return { json, sha256, url: getHostedAssetUrl(baseUrl, { extension: ".json", scope, sha256 }) };
};

// Fixtures only: a suite here would run again in every file that imports them
describe.todo("createStoredHostedAssetRecord");
