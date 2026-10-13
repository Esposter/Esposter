import { MAX_CHANNEL_LINE_LENGTH } from "#src/services/constants";

// The text of a line posted from the page, or undefined when the body is not a non-empty line within the length limit
export const readChannelLine = (body: string): string | undefined => {
  if (body.length > MAX_CHANNEL_LINE_LENGTH) return undefined;

  try {
    const parsed: unknown = JSON.parse(body);
    if (typeof parsed !== "object" || parsed === null || !("text" in parsed)) return undefined;
    if (typeof parsed.text !== "string") return undefined;

    const line = parsed.text.trim();
    return line === "" ? undefined : line;
  } catch {
    return undefined;
  }
};
