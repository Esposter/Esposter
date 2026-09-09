import type { TMXNode } from "#src/models/tmx/node/TMXNode";

// A text node carries the font and wrapping attributes Tiled writes on it, which vary per object,
// And xml2js omits the attribute key entirely when the element has none
export interface TMXTextNode extends TMXNode<Record<string, boolean | number | string> | undefined> {
  _: string;
}
