import { MAX_CHANNEL_LINE_LENGTH } from "#src/services/constants";

// The text of a line posted from the page, or undefined when the body is not a non-empty line within the length limit
export const readChannelLine = (body: string): string | undefined => {
  if (body.length > MAX_CHANNEL_LINE_LENGTH) return undefined;

  // eslint-disable-next-line no-restricted-syntax -- this package takes no workspace dep, so no getResult; invalid JSON is an undefined line
  try {
    // oxlint-disable-next-line no-restricted-properties -- a channel line carries no dates, so there is no reviver to restore one
    const parsedBody: unknown = JSON.parse(body);
    if (typeof parsedBody !== "object" || parsedBody === null || !("text" in parsedBody)) return undefined;
    if (typeof parsedBody.text !== "string") return undefined;

    const line = parsedBody.text.trim();
    return line === "" ? undefined : line;
  } catch {
    return undefined;
  }
};
