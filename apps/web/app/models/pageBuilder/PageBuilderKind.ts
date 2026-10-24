import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";
import type { ZodType } from "zod";

// A kind of document the page builder shell edits. The shell reads a document through its kind, so a document is held
// Beside the kind it was opened as, and the parts a kind holds grow as the shell's composables move onto it
export interface PageBuilderKind {
  // The schema a loaded document is parsed by, so a value the schema refuses is never held
  documentSchema: ZodType<WebpageDocument>;
}
