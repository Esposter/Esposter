import { InvalidOperationError, Operation } from "@esposter/shared";
import { readBoundedBody } from "genshin-persona/src/services/readBoundedBody.ts";

// A checked response's body, read through the one bounded reader: a body past `maxBytes` throws as a refusal does, so a
// Caller never holds an answer it did not bound. `name` is the request the body answers, which the refusal names. The
// Reader gives no undefined for a body cut short as well as one past the ceiling, so the reason names both rather than
// Sending a caller to raise the ceiling
export const readBoundedResponse = async (response: Response, name: string, maxBytes: number): Promise<Uint8Array> => {
  const bytes = await readBoundedBody(response.body, maxBytes);
  if (!bytes)
    throw new InvalidOperationError(
      Operation.Read,
      name,
      `its body is past ${maxBytes} bytes or was cut short before its end`,
    );
  return bytes;
};
