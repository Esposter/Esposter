import { getNoteExtensions } from "#shared/services/resource/note/getNoteExtensions";
import { getSchema } from "@tiptap/core";

// The writing kit's ProseMirror schema, built once: building it is most of what a render of one note costs, so the
// Document check and the render both read this one rather than each building their own
export const noteProseMirrorSchema = getSchema(getNoteExtensions());
