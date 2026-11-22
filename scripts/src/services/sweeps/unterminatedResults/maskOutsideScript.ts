import { readVueSegments } from "#src/services/shared/readVueSegments";
import { NOT_LINE_BREAK_REGEX } from "#src/services/sweeps/unterminatedResults/constants";

// A `.vue` file is markup around its `<script>` bodies, which the TypeScript parser cannot read. Everything outside
// A body is blanked and every line break kept, so a call's offset and line are still the file's own
export const maskOutsideScript = (text: string): string =>
  readVueSegments(text)
    .map(({ isScript, text: segment }) => (isScript ? segment : segment.replaceAll(NOT_LINE_BREAK_REGEX, " ")))
    .join("");
