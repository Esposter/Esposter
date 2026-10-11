import type { TMXFrame } from "#src/models/tmx/TMXFrame";
import type { TMXReadContext } from "#src/models/tmx/TMXReadContext";

// A read document: its root element's frame, or undefined for a root the reader does not model, with the context its
// Elements wrote into
export interface TMXDocument {
  context: TMXReadContext;
  root: TMXFrame | undefined;
}
