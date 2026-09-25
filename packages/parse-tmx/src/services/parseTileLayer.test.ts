import type { TMXDataNode } from "#src/models/tmx/node/TMXDataNode";
import type { TMXLayerNode } from "#src/models/tmx/node/TMXLayerNode";

import { Encoding } from "#src/models/Encoding";
import { Flipped } from "#src/models/Flipped";
import { TMXNodeType } from "#src/models/tmx/node/TMXNodeType";
import { parseTileLayer } from "#src/services/parseTileLayer";
import { assertNode } from "#src/test/assertNode.test";
import { createLayerShared } from "#src/test/createLayerShared.test";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const createNode = (data: string, encoding = Encoding.Csv) =>
  assertNode<TMXLayerNode>({
    "#name": TMXNodeType.Layer,
    $: createLayerShared(),
    $$: [],
    data: [assertNode<TMXDataNode>({ $: { encoding }, $$: undefined, _: data })],
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

  test.each([
    { data: `${gid}`, encoding: Encoding.Csv },
    { data: Buffer.alloc(Uint32Array.BYTES_PER_ELEMENT).toString("base64"), encoding: Encoding.Base64 },
  ])("rejects $encoding data that holds a different tile count than the map", async ({ data, encoding }) => {
    expect.hasAssertions();

    await expect(parseTileLayer(createNode(data, encoding), 2, false)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Read, "TMXLayer", "expected 2 tiles, received 1").message}]`,
    );
  });
});
