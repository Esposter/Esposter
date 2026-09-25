import type { TMXPropertyNode } from "#src/models/tmx/node/TMXPropertyNode";

// A `<properties>` element as its parent carries it: the child map xml2js builds, not a node of its own
export interface TMXPropertiesElement {
  property: TMXPropertyNode[];
}
