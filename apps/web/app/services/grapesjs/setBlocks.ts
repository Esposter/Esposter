import type { GrapesJsBlock } from "@/models/grapesjs/GrapesJsBlock";
import type { Block, Editor } from "grapesjs";
// Replaces a category's blocks wholesale so reactive sources (dataset columns, published surveys)
// Can be re-synced into the block manager without tracking individual block ids
export const setBlocks = (editor: Editor, category: string, blocks: GrapesJsBlock[]): void => {
  for (const block of editor.Blocks.getAll().filter((foundBlock: Block) => foundBlock.get("category") === category))
    editor.Blocks.remove(block.getId());
  for (const { content, id, label } of blocks) editor.Blocks.add(id, { category, content, label });
};
