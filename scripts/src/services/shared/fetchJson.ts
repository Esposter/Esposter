import { fetchOk } from "#src/services/shared/fetchOk";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readBoundedBody } from "genshin-persona/src/services/readBoundedBody.ts";
import { Readable } from "node:stream";

// A checked request's body as JSON, read through the one bounded read: a body past `maxBytes` throws, as a refusal
// Does, so a caller never parses an answer it did not bound
export const fetchJson = async <T>(url: string, maxBytes: number, headers?: Record<string, string>): Promise<T> => {
  const response = await fetchOk(url, { headers });
  const bytes = await readBoundedBody(response.body ? Readable.from(response.body) : null, maxBytes);
  if (!bytes) throw new InvalidOperationError(Operation.Read, url, `its body is past ${maxBytes} bytes`);
  return parseMachineJson<T>(new TextDecoder().decode(bytes));
};
