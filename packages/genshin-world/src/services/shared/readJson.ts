import { DATA_FETCH_TIMEOUT_MS } from "#src/services/constants";
import { readFileResponse } from "@esposter/shared";

// One JSON document as the host serves it, rejected when its fetch fails or does not answer in time. The time bound is
// The whole fetch, body included, so a caller reading a large or shared object passes the budget that object needs.
// The body is parsed by the reader that asked for it, so a host answering with a page for a missing file fails there.
export const readJson = async (url: string, timeoutMs: number = DATA_FETCH_TIMEOUT_MS): Promise<unknown> => {
  const response = await readFileResponse(url, timeoutMs);
  const json: unknown = await response.json();
  return json;
};
