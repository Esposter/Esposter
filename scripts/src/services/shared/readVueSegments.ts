import type { VueSegment } from "#src/models/vue/VueSegment";

import { parseSfc } from "@vizejs/native";

// A `.vue` file split at its script blocks, in file order and covering the whole text, so joining the runs gives the
// File back. The parser reports a block's body as UTF-8 byte offsets, which are cut from the bytes rather than from the
// String. A block it cannot close throws, since a half-read file would be scanned as if the rest had no script
export const readVueSegments = (text: string): VueSegment[] => {
  const { script, scriptSetup } = parseSfc(text);
  const bodies = [script, scriptSetup]
    .filter((block) => block !== null)
    .map(({ loc }) => loc)
    .toSorted((firstBody, secondBody) => firstBody.start - secondBody.start);
  const bytes = Buffer.from(text, "utf8");
  const segments: VueSegment[] = [];
  let cursor = 0;
  for (const { end, start } of bodies) {
    segments.push(
      { isScript: false, text: bytes.toString("utf8", cursor, start) },
      { isScript: true, text: bytes.toString("utf8", start, end) },
    );
    cursor = end;
  }
  segments.push({ isScript: false, text: bytes.toString("utf8", cursor) });
  return segments;
};
