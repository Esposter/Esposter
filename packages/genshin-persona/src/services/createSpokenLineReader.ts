import type { SpeechRequest } from "#src/models/SpeechRequest";

import { getLineContent } from "#src/services/getLineContent";
import { getSpokenLine } from "#src/services/getSpokenLine";

// An opening fence is three or more backticks or tildes where a line's content begins; a backtick fence's info string
// Holds no backtick, so inline code that starts a line is not one
const OPENING_FENCE_REGEX = /^(?<marker>`{3,}(?=[^`]*$)|~{3,})/u;
// A closing fence carries nothing after its marker but spaces or tabs, so a line of text that begins with one is code
const CLOSING_FENCE_REGEX = /^(?<marker>`{3,}|~{3,})[ \t]*$/u;
// A closing fence is the opening fence's character, at least its length
const isClosingFence = (content: string, opener: string) => {
  const closer = CLOSING_FENCE_REGEX.exec(content)?.groups?.marker ?? "";
  return closer.startsWith(opener.charAt(0)) && closer.length >= opener.length;
};
// What the reader holds of a message between two of its pieces: the index of the piece it last read, and the fence
// That piece left open
interface MessageReading {
  index: number;
  opener?: string;
}
// The spoken lines of each piece of a reply, in the order the pieces run. A fence can open in one piece and close in a
// Later one, so the fence a message is inside is held per message from one of its pieces to the next. A piece that
// Does not follow the one before it for its message had a piece missing between them, which may have carried the
// Fence, so it is read outside any. The reading is dropped with the message's final piece, so an unterminated block
// Never reaches the next message
export const createSpokenLineReader = () => {
  const readings = new Map<string, MessageReading>();
  return ({
    index,
    isFinal,
    markdown,
    messageId,
  }: Pick<SpeechRequest, "index" | "isFinal" | "markdown" | "messageId">): string[] => {
    const previous = readings.get(messageId);
    let opener = previous?.index === index - 1 ? previous.opener : undefined;
    const lines: string[] = [];
    for (const line of markdown.split("\n")) {
      const content = getLineContent(line);
      const openingMarker = OPENING_FENCE_REGEX.exec(content)?.groups?.marker;
      if (opener) {
        if (isClosingFence(content, opener)) opener = undefined;
      } else if (openingMarker) opener = openingMarker;
      else {
        const spokenLine = getSpokenLine(line);
        if (spokenLine !== undefined) lines.push(spokenLine);
      }
    }

    if (isFinal) readings.delete(messageId);
    else readings.set(messageId, { index, opener });
    return lines;
  };
};
