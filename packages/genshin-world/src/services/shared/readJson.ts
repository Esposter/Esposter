import { readFileResponse } from "#src/services/shared/readFileResponse";

// One JSON document as the host serves it, rejected when its fetch fails or does not answer in time. The body is parsed by
// The reader that asked for it, so a host answering with a page for a missing file fails there
export const readJson = async (url: string): Promise<unknown> => {
  const response = await readFileResponse(url);
  const json: unknown = await response.json();
  return json;
};
