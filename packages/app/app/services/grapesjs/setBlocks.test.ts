import type { GrapesJsBlock } from "@/models/grapesjs/GrapesJsBlock";
import type { Editor } from "grapesjs";
import type { Except } from "type-fest";

import { setBlocks } from "@/services/grapesjs/setBlocks";
import { describe, expect, test } from "vitest";

interface RegisteredBlock extends GrapesJsBlock {
  category: string;
}

// The block manager reduced to what setBlocks touches: a keyed registry read through Backbone-style accessors
const createEditor = (blocks: RegisteredBlock[]) => {
  const registry = new Map(blocks.map((block) => [block.id, block]));
  const editor = {
    Blocks: {
      add: (id: string, { category, content, label }: Except<RegisteredBlock, "id">) => {
        registry.set(id, { category, content, id, label });
      },
      getAll: () =>
        [...registry.values()].map((block) => ({
          get: (key: keyof RegisteredBlock) => block[key],
          getId: () => block.id,
        })),
      remove: (id: string) => {
        registry.delete(id);
      },
    },
  } as unknown as Editor;
  return { editor, registry };
};

describe(setBlocks, () => {
  const category = "Merge fields";
  const otherCategory = "Survey invites";
  const createBlock = (block?: Partial<RegisteredBlock>): RegisteredBlock => ({
    category,
    content: "content",
    id: "id",
    label: "label",
    ...block,
  });

  test("replaces the category's blocks with the new set", () => {
    expect.hasAssertions();

    const { editor, registry } = createEditor([createBlock({ id: "stale" })]);
    const block = createBlock({ id: "fresh" });

    setBlocks(editor, category, [block]);

    expect([...registry.values()]).toStrictEqual([block]);
  });

  test("leaves every other category untouched", () => {
    expect.hasAssertions();

    const otherBlock = createBlock({ category: otherCategory, id: "other" });
    const { editor, registry } = createEditor([createBlock({ id: "stale" }), otherBlock]);

    setBlocks(editor, category, []);

    expect([...registry.values()]).toStrictEqual([otherBlock]);
  });

  test("re-adds a block under the same id it replaced", () => {
    expect.hasAssertions();

    const { editor, registry } = createEditor([createBlock({ content: "old" })]);
    const block = createBlock({ content: "new" });

    setBlocks(editor, category, [block]);

    expect(registry.get(block.id)).toStrictEqual(block);
  });
});
