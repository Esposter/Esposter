import { getNoteExtensions } from "#shared/services/resource/note/getNoteExtensions";
import { getSchema } from "@tiptap/core";

// The writing kit's extensions and the ProseMirror schema they make, each built once: building the schema is most of
// What a render of one note costs, so the document check and the render both read these rather than each building
// Their own
export const noteExtensions = getNoteExtensions();
export const noteProseMirrorSchema = getSchema(noteExtensions);
