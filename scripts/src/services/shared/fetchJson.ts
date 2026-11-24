import { fetchOk } from "#src/services/shared/fetchOk";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";

// A checked request's body as JSON, read through the one bounded read: a body past `maxBytes` throws, as a refusal
// Does, so a caller never parses an answer it did not bound
export const fetchJson = async <T>(url: string, maxBytes: number, headers?: Record<string, string>): Promise<T> =>
  parseMachineJson<T>(new TextDecoder().decode(await fetchOk(url, { headers, maxBytes })));
