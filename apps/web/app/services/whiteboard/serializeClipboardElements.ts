import type { PositionedElement } from "vue-block-editor-headless";

import { WHITEBOARD_CLIPBOARD_MARKER } from "@/services/whiteboard/constants";
import { getResult } from "@esposter/shared";
import { positionedElementSchema } from "vue-block-editor-headless";
import { z } from "zod";

// The clipboard's shape: the elements a copy holds, at least one, and the marker that tells them from text copied from anywhere else
const clipboardElementsSchema = z.object({
  elements: z.array(positionedElementSchema).min(1),
  marker: z.literal(WHITEBOARD_CLIPBOARD_MARKER),
});

export const serializeClipboardElements = (elements: PositionedElement[]) =>
  JSON.stringify({ elements, marker: WHITEBOARD_CLIPBOARD_MARKER });
// The elements clipboard text was copied as, or none when the text carries no whiteboard elements or is malformed
export const parseClipboardElements = (text: string) => {
  // oxlint-disable-next-line no-restricted-properties -- an element's text can look like an ISO datetime, which reviving would turn into a Date
  const clipboardValue = getResult<unknown>(() => JSON.parse(text)).unwrapOr(undefined);

  const result = clipboardElementsSchema.safeParse(clipboardValue);
  return result.success ? result.data.elements : undefined;
};
