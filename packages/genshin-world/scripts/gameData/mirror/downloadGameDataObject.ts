import type { IncomingMessage } from "node:http";

import { DATA_FETCH_TIMEOUT_MS } from "#src/services/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { get } from "node:https";
import { buffer } from "node:stream/consumers";
import { zstdDecompressSync } from "node:zlib";

// One object's JSON as the account stores it, its zstd frame decoded here, since a plain request decodes nothing
export const downloadGameDataObject = async (url: string): Promise<string> => {
  const response = await new Promise<IncomingMessage>((resolve, reject) => {
    get(url, { signal: AbortSignal.timeout(DATA_FETCH_TIMEOUT_MS) }, resolve).on("error", reject);
  });
  const body = await buffer(response);
  if (response.statusCode !== 200)
    throw new InvalidOperationError(Operation.Read, url, `HTTP ${response.statusCode} ${response.statusMessage}`);
  return (response.headers["content-encoding"] === "zstd" ? zstdDecompressSync(body) : body).toString("utf8");
};
