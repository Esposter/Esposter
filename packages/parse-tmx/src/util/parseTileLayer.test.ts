import type { TMXDataNode } from "#src/models/tmx/node/TMXDataNode";
import type { TMXLayerNode } from "#src/models/tmx/node/TMXLayerNode";

import { Encoding } from "#src/models/Encoding";
import { Flipped } from "#src/models/Flipped";
import { TMXNodeType } from "#src/models/tmx/node/TMXNodeType";
import { assertNode } from "#src/test/assertNode.test";
import { parseTileLayer } from "#src/util/parseTileLayer";
import { describe, expect, test } from "vitest";

const createNode = (data: string) =>
  assertNode<TMXLayerNode>({
    "#name": TMXNodeType.Layer,
    $: { height: 0, id: 0, name: "", type: "", width: 0 },
    $$: [],
    data: [assertNode<TMXDataNode>({ $: { encoding: Encoding.Csv }, $$: undefined, _: data })],
  });

describe(parseTileLayer, () => {
  const gid = 1;

  test("parses csv data without translating flips", async () => {
    expect.hasAssertions();

    const layer = await parseTileLayer(createNode(`${gid},${Flipped.Horizontally | gid}`), 2, false);

    expect(layer.data).toStrictEqual([gid, Flipped.Horizontally | gid]);
    expect(layer.flips).toBeUndefined();
  });

  test("translates flips into parallel flips and stripped tile ids", async () => {
    expect.hasAssertions();

    const layer = await parseTileLayer(createNode(`${gid},${Flipped.Horizontally | gid}`), 2, true);

    expect(layer.data).toStrictEqual([gid, gid]);
    expect(layer.flips).toStrictEqual([
      { Diagonal: false, Horizontal: false, Vertical: false },
      { Diagonal: false, Horizontal: true, Vertical: false },
    ]);
  });
});
