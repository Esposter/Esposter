import { createHostedAssetRecord } from "#src/services/hostedAssets/createHostedAssetRecord";
import { getHostedAssetUrl } from "hosted-assets";
import { describe } from "vitest";

// A JSON record named by the hash of its own compact bytes, and stored under the scope it is published under
export const createStoredHostedAssetRecord = (baseUrl: string, scope: string, value: unknown) => {
  const record = createHostedAssetRecord(scope, value, false);
  return { json: record.json, sha256: record.sha256, url: getHostedAssetUrl(baseUrl, record) };
};

// Fixtures only: a suite here would run again in every file that imports them
describe.todo("createStoredHostedAssetRecord");
