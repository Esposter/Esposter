import type { MjmlBuiltInNode } from "#src/models/MjmlBuiltInNode";
import type { MjmlLeafNode } from "#src/models/MjmlLeafNode";

// Any node an MJML document holds: one of MJML's built-in types, or a leaf type a consumer declared
export type MjmlNode = MjmlBuiltInNode | MjmlLeafNode;
