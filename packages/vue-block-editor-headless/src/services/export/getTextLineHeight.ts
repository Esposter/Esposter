import type { TextSize } from "#src/models/TextSize";

import { TEXT_LINE_HEIGHT_SHARE } from "#src/services/export/constants";

// The step down from one line of a text to the next, in document units: a share of the text's size
export const getTextLineHeight = (textSize: TextSize): number => textSize * TEXT_LINE_HEIGHT_SHARE;
