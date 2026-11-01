import type { PanzoomDrag } from "#src/models/panzoom/PanzoomDrag";
import type { PanzoomElement } from "#src/models/panzoom/PanzoomElement";
import type { PanzoomOptions } from "#src/models/panzoom/PanzoomOptions";
import type { PanzoomPinch } from "#src/models/panzoom/PanzoomPinch";
import type { PanzoomPoint } from "#src/models/panzoom/PanzoomPoint";
import type { PanzoomState } from "#src/models/panzoom/PanzoomState";

// What one panzoom keeps and every function acting on it shares: the element and its parent, the options and the transform's values.
// The pointers down and the gesture they make, and each inline style it wrote with the value that style held before the write
export interface PanzoomContext {
  drag?: PanzoomDrag;
  element: PanzoomElement;
  isClickSuppressed: boolean;
  options: PanzoomOptions;
  parent: PanzoomElement;
  pinch?: PanzoomPinch;
  pointers: Map<number, PanzoomPoint>;
  state: PanzoomState;
  styles: Map<PanzoomElement, Map<string, string>>;
}
