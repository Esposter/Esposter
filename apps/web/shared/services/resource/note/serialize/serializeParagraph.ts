import type { JSONContent } from "@tiptap/core";

import { escapeLineStarts } from "#shared/services/resource/note/serialize/escapeLineStarts";
import { serializeInline } from "#shared/services/resource/note/serialize/serializeInline";

export const serializeParagraph = (node: JSONContent) => escapeLineStarts(serializeInline(node.content ?? []));
