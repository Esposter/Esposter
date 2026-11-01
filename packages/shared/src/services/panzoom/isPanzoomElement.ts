import type { PanzoomElement } from "#src/models/panzoom/PanzoomElement";

// An element from any document carries an inline style, whichever window it was created in, so the check is on the property
export const isPanzoomElement = (value: Element): value is PanzoomElement => "style" in value;
