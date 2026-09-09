import type { TMXImageNode } from "#src/models/tmx/node/TMXImageNode";
import type { TMXTileNode } from "#src/models/tmx/node/TMXTileNode";
import type { TMXTilesetNode } from "#src/models/tmx/node/TMXTilesetNode";

import { TMXNodeType } from "#src/models/tmx/node/TMXNodeType";
import { assertNode } from "#src/test/assertNode.test";
import { createEmbeddedTilesetShared } from "#src/test/createEmbeddedTilesetShared.test";
import { createExternalTilesetShared } from "#src/test/createExternalTilesetShared.test";
import { createImageShared } from "#src/test/createImageShared.test";
import { parseTileset } from "#src/util/parseTileset";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(parseTileset, () => {
  const id = 0;
  const image = assertNode<TMXImageNode>({ "#name": TMXNodeType.Image, $: createImageShared(), $$: undefined });

  test("clones an external tileset", () => {
    expect.hasAssertions();

    const external = createExternalTilesetShared();

    expect(parseTileset(assertNode<TMXTilesetNode>({ $: external, $$: undefined }))).toStrictEqual(external);
  });

  test("parses an embedded tileset's image and tiles", () => {
    expect.hasAssertions();

    const tile = [assertNode<TMXTileNode>({ $: { id }, $$: [] })];
    const tileset = parseTileset(assertNode<TMXTilesetNode>({ $: createEmbeddedTilesetShared(), $$: [image], tile }));

    expect(tileset).toStrictEqual({ ...createEmbeddedTilesetShared(), image: createImageShared(), tiles: [{ id }] });
  });

  test("fails to parse an embedded tileset without an image", () => {
    expect.hasAssertions();

    expect(() =>
      parseTileset(assertNode<TMXTilesetNode>({ $: createEmbeddedTilesetShared(), $$: [] })),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Read, "parseTileset", createEmbeddedTilesetShared().name).message}]`,
    );
  });
});
