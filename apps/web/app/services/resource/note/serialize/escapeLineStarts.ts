import { LINE_START_MARKER_REGEX } from "@/services/resource/note/serialize/constants";

// A paragraph line that begins with a block marker reads back as that block, so the marker is escaped
export const escapeLineStarts = (text: string) => text.replaceAll(LINE_START_MARKER_REGEX, "$1\\$2");
