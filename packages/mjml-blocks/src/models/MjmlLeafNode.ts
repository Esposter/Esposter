import type { MjmlLeafNodes } from "#src/models/MjmlLeafNodes";

// Any leaf node a consumer declared, the union of the types merged into the leaf node map
export type MjmlLeafNode = MjmlLeafNodes[keyof MjmlLeafNodes];
