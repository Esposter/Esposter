import type { Editor } from "grapesjs";

// Replaces a category's blocks wholesale so reactive sources (dataset columns, published surveys)
// Can be re-synced into the block manager without tracking individual block ids
export const setBlocks = (
  editor: Editor,
  category: string,
  blocks: { content: string; id: string; label: string }[],
): void => {
  for (const block of editor.Blocks.getAll().filter((foundBlock) => foundBlock.get("category") === category))
    editor.Blocks.remove(block.getId());
  for (const { content, id, label } of blocks) editor.Blocks.add(id, { category, content, label });
};
