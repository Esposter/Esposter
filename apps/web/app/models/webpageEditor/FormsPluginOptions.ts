import type { BlockProperties } from "grapesjs";

export interface FormsPluginOptions {
  block?: (blockId: string) => Partial<BlockProperties>;
  blocks?: string[];
  category?: BlockProperties["category"];
}
